const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const pug = require('pug');
const moment = require('moment-timezone');
const { markdown, extractKeywords } = require('./extension');
const Promise = require('bluebird');
const { PUBLIC_DIR, THEME_DIR, SITE_CONFIG, OUTPUT_DIR } = require('./config');
const { ENCODING, baseroot } = require('./util');

const map = new Map();

const env = _.memoize(function (obj) {
    obj = _.assign({ home: false, post: false, page: false, archive: false, tag: false, current: false }, obj);
    return _.reduce(_.keys(obj), (a, b) => {
        if (_.isFunction(obj[b])) {
            a[`is_${b}`] = obj[b];
        } else {
            a[`is_${b}`] = () => obj[b];
        }
        return a;
    }, {});
});

function desc(posts) {
    return [...posts].sort((a, b) => {
        return b.date.diff(a.date);
    });
}

function inject(...args) {
    return args.reduce((a, b) => {
        return Object.assign(a, b);
    }, {
            _,
            site: SITE_CONFIG,
            moment,
            titlecase(str) {
                return str.toUpperCase();
            },
            format_date(date, format = SITE_CONFIG.dateformat) {
                return (moment.isMoment(date) ? date : moment(date)).tz(SITE_CONFIG.timezone).format(SITE_CONFIG.dateformat || 'll');
            },
            url_for(...path) {
                path = path.join('');
                if (/^http/i.test(path)) {
                    return path
                } else {
                    const root = SITE_CONFIG.get('root', '/');
                    return path.startsWith(root) ? path : root + _.trimStart(path, '/');
                }
            }
        });
}

function checkCurrentPath(url) {
    return function (path) {
        if (!path || typeof path !== 'string') {
            return false;
        } else {
            return baseroot(path) === baseroot(url);
        }
    }
}

async function render(path, locals) {
    if (map.has(path)) {
        return map.get(path)(locals);
    } else {
        map.set(
            path,
            pug.compile(await fs.readFile(path, { encoding: ENCODING }), { pretty: true, filename: path })
        );
        return render(path, locals);
    }
}

async function copyResources(dir, resources, dest) {
    return Promise.map(resources, resource => {
        return fs.copy(
            path.join(dir, resource),
            path.join(dest, resource)
        );
    });
}

async function renderPost(post) {
    const postPath = `${post.date.utc().format('YYYY/MM/DD')}/${post.s || post.postName}/`;
    const url = baseroot(postPath);
    Object.assign(post, {
        path: postPath,
        url,
        keywords: post.keywords ? post.keywords : extractKeywords(post),
        excerpt: await markdown(post.excerpt, url, post.resourcesDir),
        content: await markdown(post.content, url, post.resourcesDir)
    });
    const generatePath = `${OUTPUT_DIR}${postPath}`;
    const html = await render(
        path.join(THEME_DIR, 'post.pug'),
        inject(
            env({ current: path => path === post.url }),
            { post }
        )
    );
    await fs.mkdirs(generatePath);
    await Promise.all([
        fs.writeFile(path.join(generatePath, 'index.html'), html),
        copyResources(post.resourcesDir, post.resources, generatePath)
    ]);
}

async function renderPage(post) {
    const postPath = `${post.s || post.postName}/`;
    const url = baseroot(postPath);
    const html = await render(
        path.join(THEME_DIR, 'page.pug'),
        inject(
            env({ page: true, current: checkCurrentPath(url) }),
            { post: _.assign(post, { path: `${postPath}index.html`, url, content: await markdown(post.content, url, post.resourcesDir, { sanitize: false }) }) }
        )
    );
    const generatePath = `${OUTPUT_DIR}/${postPath}`;
    await fs.mkdirs(generatePath);
    await Promise.all([
        await fs.writeFile(path.join(generatePath, 'index.html'), html),
        copyResources(post.resourcesDir, post.resources, generatePath)
    ]);
}

async function renderArchive(posts) {
    await renderPaginate(
        desc(posts),
        env({ archive: true, current: checkCurrentPath('archive') }),
        '/archive/',
        'archive'
    );
}

async function renderTags(posts) {
    const map = new Map();
    for (const post of desc(posts)) {
        if (post.tags && post.tags.length) {
            const tags = _.map(post.tags, 'name');
            tags.forEach(tag => {
                if (map.has(tag)) {
                    map.get(tag).push(post);
                } else {
                    map.set(tag, [post]);
                }
            });
        }
    }
    await Promise.each(map.keys(), async tag => {
        return renderPaginate(
            map.get(tag),
            env({ tag: name => name == null || name === tag, current: checkCurrentPath(`tags/${tag}`) }),
            `/tags/${tag}/`,
            'archive'
        );
    });
}

async function renderPaginate(posts, helpers = {}, prefix = '/', layout = 'index') {
    const pageSize = SITE_CONFIG.get('pageSize', 10);
    const postsChunk = _.chunk(posts, pageSize);
    await Promise.each(_.range(0, postsChunk.length), async idx => {
        const chunk = postsChunk[idx];
        const current = idx + 1;
        const locals = {
            has_prev: current > 1,
            has_next: current < postsChunk.length,
            page_numbers: _.map(_.range(1, postsChunk.length + 1), number => {
                return {
                    number,
                    current: number === current,
                    link: number === 1 ? prefix : `${prefix}page/${number}`
                };
            }),
            next_link: `${prefix}page/${current + 1}`,
            prev_link: current === 2 ? prefix : `${prefix}page/${current - 1}`,
            posts: chunk
        };
        const html = await render(
            path.join(THEME_DIR, `${layout}.pug`),
            inject(locals, helpers)
        );
        const generatePath = current === 1 ? `${OUTPUT_DIR}/${prefix}` : `${OUTPUT_DIR}${prefix}/page/${current}`;
        await fs.mkdirs(generatePath);
        await fs.writeFile(path.join(generatePath, 'index.html'), html);
    });
}

async function renderList(posts) {
    await renderPaginate(
        desc(posts),
        env({ home: true, current: checkCurrentPath('') })
    );
}

async function renderAtom(posts) {
    const tpl = pug.compile(
        await fs.readFile(path.join(__dirname, 'atom.pug'), { encoding: ENCODING }),
        { pretty: true }
    );
    await fs.writeFile(`${OUTPUT_DIR}/atom.xml`, tpl(inject({ posts })));
}

async function renderWordPress(posts) {
    const tpl = pug.compile(
        await fs.readFile(path.join(__dirname, 'wordpress.pug'), { encoding: ENCODING }),
        { pretty: true }
    );
    await fs.writeFile(`${OUTPUT_DIR}/wordpress.xml`, tpl(inject({ posts })));
}

module.exports = {
    render,
    renderPost,
    renderPage,
    renderArchive,
    renderList,
    renderTags,
    renderAtom,
    renderWordPress
};