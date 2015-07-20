/* @flow weak */
var addonDiscovery = require('./discovery'),
    assert = require('assert'),
    noop = require('lodash/utility/noop'),
    forOwn = require('lodash/object/forOwn'),
    callbacks = require('./callbacks'),
    reduce = require('lodash/collection/reduce');

var _callbacks = {},
    logger = require('./../logger').build('addon-loader');

/*eslint no-underscore-dangle: 0 */
var _hooks = {},
    _loaded = false;

exports.unload = function () {
    _loaded = false;
    _hooks = {};
};

/**
 * Function to load all addons starting from a given root using a given pkg
 * @param {string} root root path
 * @param {object} pkg package.json object
 * @returns {void}
 */
exports.load = function (root/*: string */, pkg) {
    var addons = addonDiscovery.discover(root, pkg);

    /* istanbul ignore next */
    if (addons.length) {
        logger.info('using addons: ' + addons.map(function (addon) { return addon.pkg.name + '@' + addon.pkg.version; }).join(', '));
    }
    _loaded = true;

    _hooks = reduce(addons, function (hooks, addon) {
        forOwn(addon.hooks, function (val, key) {
            if (!hooks[key]) { hooks[key] = []; }

            hooks[key].push({
                hook: addon.hooks[key],
                addon: addon
            });
        });
        return hooks;
    }, _hooks);

    callbacks(exports);
};

exports.callback = function (hookName/*: string */, callback/*: function */) {
    _callbacks[hookName] = callback;
};

/**
 * Creates a function that can be called with additional params that calls all addons for a given hook
 * @param {string} hookName name of the hook
 * @param {object} hookConfig config object that is provided to each hook
 * @return {function} generated hook function
 */
exports.hook = function(hookName/*: string */, hookConfig/*: any */)/*: function */ {
    assert(_loaded, 'addons have to be loaded before calling any hooks');
    assert(_callbacks[hookName], 'no registered callback for ' + hookName);

    var hookFunction = noop;

    if (_hooks[hookName]) {
        hookFunction = function () {
            /*eslint camelcase:0*/
            // @via https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
            var $_len = arguments.length; var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i]; }

            for (var i = 0; i < _hooks[hookName].length; i++) {
                _callbacks[hookName].apply(undefined, args)(_hooks[hookName][i].hook(hookConfig));
            }
        };
    }

    return hookFunction;
};
