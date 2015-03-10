var addonDiscovery = require('./addon-discovery'),
    isFunction = require('lodash/lang/isFunction'),
    assert = require('assert'),
    forEach = require('lodash/collection/forEach');

var logger = require('./logger')('addon-loader');

/*eslint no-underscore-dangle: 0 */
var _addons = [],
    _loaded = false;

exports.load = function (root, pkg) {
    var addons = addonDiscovery.discover(root, pkg);
    logger.info('using addons', addons.map(function (addon) { return addon.pkg.name + '@' + addon.pkg.version; }));
    _loaded = true;
    _addons = addons;
    return _addons;
};

/**
 * Call all addon hooks for hookName
 * @param {String} hookName name of hook to call
 * @param {Object} [hookConfig] optional object to pass to hook
 * @param {Function} callback callback to invoke hook result to
 * @returns {void}
 */
exports.hook = function(hookName, hookConfig, callback) {
    assert(_loaded, 'addons have to be loaded before calling any hooks');

    if (isFunction(hookConfig)) {
        callback = hookConfig;
        hookConfig = undefined;
    }

    forEach(_addons, function (addonItem) {
        if (addonItem.hooks.hasOwnProperty(hookName)) {
            if(isFunction(callback)){
                callback(addonItem.hooks[hookName](hookConfig));
            } else {
                addonItem.hooks[hookName](hookConfig);
            }
        }
    });
};
