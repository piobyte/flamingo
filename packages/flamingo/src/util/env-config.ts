/**
 * Environment object mapping module
 * @module
 */
import forEach = require("lodash/forEach");
import set = require("lodash/set");
import Config = require("../../config");
import Mapping from "../types/Mapping";

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

export = function (
  config: Config | {},
  environment: { [key: string]: string | undefined },
  mappings: Array<Mapping>
): Config | {} {
  forEach(mappings, function (mapping: Mapping) {
    const [envProp, objPath] = mapping;
    let setVal;
    if (mapping.length === 3) {
      setVal = mapping[2];
    }

    if (environment.hasOwnProperty(envProp)) {
      set(
        config,
        objPath,
        typeof setVal === "function"
          ? setVal(environment[envProp])
          : environment[envProp]
      );
    }
  });
  return config;
};
