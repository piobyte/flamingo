/* @flow weak */
var fs = require('fs'),
    assign = require('lodash/object/assign'),
    path = require('path');

var logger = require('./../logger')('addon-discovery');

var ADDON_KEYWORD = 'flamingo-addon';

function resolvePkg(addon/*: {path: string; hooks: {}; pkg: {name: string; main: string}}*/) {
    var main = addon.pkg.main || 'index.js',
        mainPath,
        loadedAddon;

    mainPath = path.join(addon.path, main);

    /*eslint no-sync: 0*/
    if (fs.existsSync(mainPath)) {
        addon.hooks = require(mainPath);
        loadedAddon = addon;
    } else {
        logger.warn('can\'t find entrypoint for addon:', addon.pkg.name);
    }
    return loadedAddon;
}

function fromPackage(packagePath/*: string */) {
    var pkg = path.join(packagePath, 'package.json');
    if (fs.existsSync(pkg)) {
        var content = require(pkg);
        var keywords = content.keywords || [];

        if (keywords.indexOf(ADDON_KEYWORD) > -1) {
            return {
                path: packagePath,
                pkg: content
            };
        }
    } else {
        logger.debug('no package.json found at ' + path);
    }
}

function discover(rootDir/*: string */, pkg/*: {dependencies: any; devDependencies: any} */) {
    var deps = assign({}, pkg.dependencies, pkg.devDependencies);

    return Object.keys(deps).map(function (dependency) {
        return fromPackage(path.join(rootDir, 'node_modules/', dependency, '/'));
    }).filter(Boolean).map(function (addon) {
        return resolvePkg(addon);
    }).filter(Boolean);
}

exports.fromPackage = fromPackage;
exports.resolvePkg = resolvePkg;
exports.discover = discover;
