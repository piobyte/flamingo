/* @flow weak */
var envConfig = require('./../util/env-config'),
  addon = require('./index'),
  assign = require('lodash/object/assign'),
  merge = require('lodash/object/merge'),
  partial = require('lodash/function/partial');

function mergeBufferAware(a, b) {
  if (b instanceof Buffer) {
    return b;
  }
}

module.exports = function (addons/*: {callback: function} */)/*: {callback: function} */ {
  addons.callback(addon.HOOKS.CONF, function (conf) {
    return function (addonConf) {
      // overwrite addon config with config.js content and merge the result into config.js
      merge(conf, merge(addonConf, conf, mergeBufferAware), mergeBufferAware);
    };
  });
  addons.callback(addon.HOOKS.ENV, function (config, environment) {
    // call envConfig on the config.js object given the addon env mappings
    return partial(envConfig, config, environment);
  });
  addons.callback(addon.HOOKS.PROFILES, function (profiles) {
    // put addon profile fields on the existing profiles object
    return partial(assign, profiles);
  });
  addons.callback(addon.HOOKS.ROUTES, function (server) {
    // add additional routes
    return server.route.bind(server);
  });
  addons.callback(addon.HOOKS.HAPI_PLUGINS, function (plugins) {
    // add hapi plugins
    return plugins.push.bind(plugins);
  });
  addons.callback(addon.HOOKS.LOG_STREAM, function (logger) {
    // add logger stream
    return logger.addStreams;
  });

  return addons;
};
