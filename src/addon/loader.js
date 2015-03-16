var addonDiscovery = require('./discovery'),
    assert = require('assert'),
    noop = require('lodash/utility/noop'),
    forOwn = require('lodash/object/forOwn'),
    callbacks = require('./callbacks'),
    forEach = require('lodash/collection/forEach'),
    reduce = require('lodash/collection/reduce');

var _callbacks = {},
    logger = require('./../logger')('addon-loader');

/*eslint no-underscore-dangle: 0 */
var _hooks = {},
    _loaded = false;

exports.unload = function () {
    _loaded = false;
    _hooks = {};
};

exports.load = function (root, pkg) {
    var addons = addonDiscovery.discover(root, pkg);
    logger.info('using addons', addons.map(function (addon) { return addon.pkg.name + '@' + addon.pkg.version; }));
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

exports.callback = function (hookName, callback) {
    _callbacks[hookName] = callback;
};
exports.hook = function(hookName, hookConfig) {
    assert(_loaded, 'addons have to be loaded before calling any hooks');
    assert(_callbacks[hookName], 'no registered callback for ' + hookName);

    var hookFunction = noop;

    if (_hooks[hookName]) {
        hookFunction = function () {
            /*eslint camelcase:0*/
            // @via https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
            var $_len = arguments.length; var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i]; }

            forEach(_hooks[hookName], function (data) {
                _callbacks[hookName].apply(undefined, args)(data.hook(hookConfig));
            });
        };
    }

    return hookFunction;
};
