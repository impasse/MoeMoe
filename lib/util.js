const fs = require('fs-extra');
const path = require('path');
const { ROOT, SITE_CONFIG } = require('./config');



async function isFile(path) {
    return await fs.exists(path)
        && (await fs.stat(path)).isFile();
}

async function isDirectory(path) {
    return await fs.exists(path)
        && (await fs.stat(path)).isDirectory();
}

function baseroot(p) {
    return path.join(
        SITE_CONFIG.get('root', '/'),
        p.replace(/^\//, '')
    );
}

function h(type, props, children) {
    return `<${type}${
        Object.entries(props).reduce((a, [k,v]) => {
            if(v) {
                return a+= ` ${k}="${v}"`;
            } else {
                return a;
            }
        }, '')
    }>${children || ''}</${type}>`;
}

module.exports = {
    isDirectory,
    isFile,
    baseroot,
    h
};