const path = require('path');
const process = require('process');
const _ = require('lodash');
const fs = require('fs-extra');
const Yaml = require('js-yaml');
const moment = require('moment-timezone');
const readdirp = require('fs-readdir-promise');
const Promise = require('bluebird');
const { renderPost, renderPage, renderList, renderArchive, renderTags, renderAtom } = require('./render');
const { isDirectory, isFile, baseroot } = require('./util');
const { ROOT, POSTS_DIR, SOURCE_DIR, THEME_DIR, PUBLIC_DIR, OUTPUT_DIR, SITE_CONFIG, ENCODING } = require('./config');

process.on('unhandledRejection', console.error);

function parseTags(tags) {
    tags = typeof tags === 'string' ? tags.split(/\s+/) : tags;
    return _.map(tags, tag => {
        return {
            name: tag,
            path: `tags/${tag}/`,
            url: baseroot(`tags/${tag}/`)
        };
    });
}

async function parsePost(data) {
    const [__, rawHeader, rawContent] = data.split(/--+\n/);
    const header = Yaml.safeLoad(rawHeader, { schema: Yaml.JSON_SCHEMA });
    const [excerpt, other] = rawContent.split(/<!--\s*more\s*-->/i);
    const timezone = SITE_CONFIG.get('timezone', 'UTC');
    return _.assign(header, {
        has_more: other && other.length !== 0,
        date: moment.tz(header.date, timezone),
        excerpt,
        content: other ? excerpt + other : excerpt,
        tags: parseTags(header.tags)
    });
}

async function readPosts() {
    const postsName = await Promise.filter(fs.readdir(POSTS_DIR), async fileName => {
        return /\.md$/i.test(fileName) && await isFile(path.join(POSTS_DIR, fileName));
    }).map(fileName => {
        return /^(.+)\.md$/i.exec(fileName)[1];
    });
    const posts = await Promise.map(postsName, async postName => {
        const resourcesDir = path.join(POSTS_DIR, postName);
        const resources = await isDirectory(resourcesDir) ? await readdirp(resourcesDir) : [];
        return _.merge(
            await parsePost(await fs.readFile(path.join(POSTS_DIR, `${postName}.md`), { encoding: ENCODING })),
            { postName, resources, resourcesDir }
        );
    });
    return posts;
}

async function copyAsserts() {
    const basedir = path.join(THEME_DIR, 'source');
    const opts = {
        filter(path) {
            return !/\/_\w+/.test(path);
        }
    };
    await Promise.all([
        await fs.copy(basedir, OUTPUT_DIR, opts),
        await fs.copy(SOURCE_DIR, OUTPUT_DIR, opts)
    ]);
}

async function main() {
    await fs.ensureDir(PUBLIC_DIR);
    await fs.emptyDir(PUBLIC_DIR);
    const all = await readPosts(); // page are post
    const [pages, posts] = _.partition(all, post => post.page);
    await Promise.all([
        copyAsserts(),
        Promise.each(posts, renderPost),
        Promise.each(pages, renderPage)
    ]);
    await Promise.all([
        renderList(posts),
        renderArchive(posts),
        renderTags(posts),
        renderAtom(posts)
    ]);
}

if (require.main === module) {
    (async function () {
        console.time('build');
        await main();
        console.timeEnd('build');
    })();
}

module.exports = {
    main
};
