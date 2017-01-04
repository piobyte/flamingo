/* @flow weak */
/**
 * Addon callbacks module
 * @module
 */

const envConfig = require('./../util/env-config');
const {HOOKS:{
  CONF,
  ENV,
  ROUTES,
  HAPI_PLUGINS,
  PROFILES,
  LOG_STREAM,
  EXTRACT_PROCESS,
  START,
  STOP
}} = require('./index');
const assign = require('lodash/assign');
const mergeWith = require('lodash/mergeWith');
const partial = require('lodash/partial');
const noop = require('lodash/noop');

/**
 * Function to be used as merge callback. It's required because by default, lodash isn't keeping a Buffer as a Buffer
 * @see https://github.com/lodash/lodash/issues/1453#issuecomment-139311305
 * @param {*} a
 * @param {*} b
 * @private
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
  loader.callback(CONF, function (conf) {
    return function (addonConf) {
      // overwrite addon config with config.js content and merge the result into config.js
      mergeWith(conf, mergeWith(addonConf, conf, mergeBufferAware), mergeBufferAware);
    };
  });
  loader.callback(EXTRACT_PROCESS, function (extracted, operation) {
    return function (addonExtractFunction) {
      return addonExtractFunction(extracted, operation);
    };
  });
  loader.callback(ENV, function (config, environment) {
    // call envConfig on the config.js object given the addon env mappings
    return partial(envConfig, config, environment);
  });
  loader.callback(PROFILES, function (profiles) {
    // put addon profile fields on the existing profiles object
    return partial(assign, profiles);
  });
  loader.callback(ROUTES, function (server) {
    // add additional routes
    return server.route.bind(server);
  });
  loader.callback(HAPI_PLUGINS, function (plugins) {
    // add hapi plugins
    return plugins.push.bind(plugins);
  });
  loader.callback(LOG_STREAM, function (logger) {
    // add logger stream
    return logger.addStreams;
  });
  // start and stop do nothing except calling the hook
  loader.callback(START, () => noop);
  loader.callback(STOP, () => noop);

  return loader;
};
