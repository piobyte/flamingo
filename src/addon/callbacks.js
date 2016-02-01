/* @flow weak */
const envConfig = require('./../util/env-config');
const addon = require('./index');
const assign = require('lodash/assign');
const mergeWith = require('lodash/mergeWith');
const partial = require('lodash/partial');

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
 * @param {object} loader
 * @returns {*}
 */
module.exports = function (loader/*: {callback: function} */)/*: {callback: function} */ {
  loader.callback(addon.HOOKS.CONF, function (conf) {
    return function (addonConf) {
      // overwrite addon config with config.js content and merge the result into config.js
      mergeWith(conf, mergeWith(addonConf, conf, mergeBufferAware), mergeBufferAware);
    };
  });
  loader.callback(addon.HOOKS.ENV, function (config, environment) {
    // call envConfig on the config.js object given the addon env mappings
    return partial(envConfig, config, environment);
  });
  loader.callback(addon.HOOKS.PROFILES, function (profiles) {
    // put addon profile fields on the existing profiles object
    return partial(assign, profiles);
  });
  loader.callback(addon.HOOKS.ROUTES, function (server) {
    // add additional routes
    return server.route.bind(server);
  });
  loader.callback(addon.HOOKS.HAPI_PLUGINS, function (plugins) {
    // add hapi plugins
    return plugins.push.bind(plugins);
  });
  loader.callback(addon.HOOKS.LOG_STREAM, function (logger) {
    // add logger stream
    return logger.addStreams;
  });

  return loader;
};
