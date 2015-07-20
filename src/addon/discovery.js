/* @flow weak */
/**
 * @module flamingo/src/addon/discovery
 */
var fs = require('fs'),
    assign = require('lodash/object/assign'),
    path = require('path');

var logger = require('./../logger').build('addon-discovery');

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
        logger.warn('can\'t find entrypoint for addon: ' + addon.pkg.name);
    }
    return loadedAddon;
}

/**
 * Generates an object containing useful information (package.json content, package path) for a given dependency package path,
 * if the package keywords mathes the `ADDON_KEYWORD` value.
 * @param {string} packagePath path to a given node package
 * @return {{path: *, pkg: *}} Object if the package keywords math the `ADDON_KEYWORD` value
 */
function fromPackage(packagePath/*: string */)/*: ?{path: string, pkg: {name: string}} */ {
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

/**
 * Function to discover addons by checking each package dependency by looking in the rootDir/`node_modules` directory
 * @param {String} rootDir root directory string path
 * @param {object} pkg npm package.json object
 * @return {Array.<T>} discovered addons
 */
function discover(rootDir/*: string */, pkg/*: {dependencies: any; devDependencies: any} */) {
    var deps = assign({}, pkg.dependencies, pkg.devDependencies);

    return Object.keys(deps)
        .map(function (dependency) {
            return fromPackage(path.join(rootDir, 'node_modules/', dependency, '/'));
        })
        .filter(Boolean)
        .map(function (addon) {
            return resolvePkg(addon);
        })
        .filter(Boolean);
}

exports.fromPackage = fromPackage;
exports.resolvePkg = resolvePkg;
exports.discover = discover;
