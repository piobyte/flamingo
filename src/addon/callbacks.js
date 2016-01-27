/* @flow weak */
var envConfig = require('./../util/env-config'),
  addon = require('./index'),
  assign = require('lodash/assign'),
  mergeWith = require('lodash/mergeWith'),
  partial = require('lodash/partial');

/**
 * Function to be used as merge callback. It's required because by default, lodash isn't keeping a Buffer as a Buffer
 * @see https://github.com/lodash/lodash/issues/1453#issuecomment-139311305
 * @param {*} a
 * @param {*} b
 * @returns {Buffer|undefined} b if b is Buffer
 */
function mergeBufferAware(a, b) {
  if (b instanceof Buffer) {
    return b;
  }
}

/**
 * Register default flamingo addon callbacks
 * @param {object} addons
 * @returns {*}
 */
module.exports = function (addons/*: {callback: function} */)/*: {callback: function} */ {
  addons.callback(addon.HOOKS.CONF, function (conf) {
    return function (addonConf) {
      // overwrite addon config with config.js content and merge the result into config.js
      mergeWith(conf, mergeWith(addonConf, conf, mergeBufferAware), mergeBufferAware);
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
