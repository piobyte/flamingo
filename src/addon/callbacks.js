/* @flow weak */
var envConfig = require('./../util/env-config'),
    addon = require('./index'),
    assign = require('lodash/object/assign'),
    merge = require('lodash/object/merge'),
    partial = require('lodash/function/partial');

module.exports = function (addons/*: {callback: function} */)/*: {callback: function} */ {
    addons.callback(addon.HOOKS.CONF, function (conf) {
        return function (addonConf) {
            merge(conf, merge(addonConf, conf));
        };
    });
    addons.callback(addon.HOOKS.ENV, function(config, environment) {
        return partial(envConfig, config, environment);
    });
    addons.callback(addon.HOOKS.PROFILES, function (profiles) {
        return partial(assign, profiles);
    });
    addons.callback(addon.HOOKS.ROUTES, function (server) {
        return server.route.bind(server);
    });
    addons.callback(addon.HOOKS.HAPI_PLUGINS, function (plugins) {
        return plugins.push.bind(plugins);
    });
    addons.callback(addon.HOOKS.LOG_STREAM, function (logger) {
        return logger.addStreams;
    });

    return addons;
};
