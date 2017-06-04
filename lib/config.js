const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const Yaml = require('js-yaml');

const ENCODING = 'utf-8';
const ROOT = path.join(__dirname, '../');
const POSTS_DIR = path.join(ROOT, 'source/_posts');
const SOURCE_DIR = path.join(ROOT, 'source');
const THEME_DIR = path.join(ROOT, 'theme');
const PUBLIC_DIR = path.join(ROOT, 'public');

const SITE_CONFIG = Yaml.safeLoad(fs.readFileSync(path.join(ROOT, 'config.yaml')));

SITE_CONFIG.get = (k, d) => _.get(SITE_CONFIG, k, d);

const OUTPUT_DIR = PUBLIC_DIR + SITE_CONFIG.get('root', '/');

module.exports = {
    ENCODING,
    ROOT,
    POSTS_DIR,
    THEME_DIR,
    PUBLIC_DIR,
    OUTPUT_DIR,
    SITE_CONFIG,
    SOURCE_DIR
};