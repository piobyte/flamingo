/* @flow */
/**
 * Environment object mapping module
 * @module flamingo/src/util/env-config
 */
var forEach = require('lodash/forEach');

var pathSet = function (object/*: Object */, path/*: string */, value/*: any */) {
  var obj = object;

  forEach(path.split('.'), function (segment, index, paths) {
    var isLast = index + 1 === paths.length;
    if (!obj.hasOwnProperty(segment)) {
      obj[segment] = isLast ? value : {};
    } else if (isLast) {
      obj[segment] = value;
    }
    obj = obj[segment];
  });
};

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
      pathSet(config, objPath,
        typeof setVal === 'function' ? setVal(environment[envProp]) : environment[envProp]);
    }
  });
  return config;
};
