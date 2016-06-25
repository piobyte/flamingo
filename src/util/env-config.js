/* @flow */
/**
 * Environment object mapping module
 * @module flamingo/src/util/env-config
 */
const forEach = require('lodash/forEach');
const set = require('lodash/set');

/**
 * Use mapping to overwrite config fields with corresponding environment object fields.
 * If given, call a parsing function.
 * Each mapping must contains the environment variable name, an path to the config object target
 * and an optional parsing function.
 *
 * @example
 * envConfig(conf, env, [
 *    ['FOO', 'FOO'],
 *    ['OBJ_PATH', 'OBJ.PATH', envParser.int(0)]
 * ])
 * @param {Object} config Config object
 * @param {Object} environment Environment object (usually process.env)
 * @param {Array} mappings Environment to object mappings
 * @returns {Object} updated config
 */
module.exports = function (config/*: Config */, environment/*: {[key: string]: string} */, mappings/*: Array<[string, string, ?function]>*/)/*: Config */ {
  forEach(mappings, function ([envProp, objPath, setVal]) {
    if (environment.hasOwnProperty(envProp)) {
      set(config, objPath,
        typeof setVal === 'function' ? setVal(environment[envProp]) : environment[envProp]);
    }
  });
  return config;
};
