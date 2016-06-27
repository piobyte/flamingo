/* @flow */
/**
 * Function deprecation module
 * @module flamingo/src/util/deprecate
 */

const logger = require('../logger').build('deprecate');

/**
 * Function to deprecate usage of a given function. It follows the same method signature as io.js/node.js util.deprecate.
 * @see https://iojs.org/api/util.html#util_util_deprecate_function_string
 * @param {function} deprecatedFunction function to deprecate
 * @param {string} warning message to display
 * @param {object} options deprecation method options
 * @return {*} deprecatedFunction return value
 * @example
 * deprecate(() => myOldFoo(), 'myOldFoo is deprecated, use myNewFoo instead.');
 */
module.exports = function (deprecatedFunction/*: function */, warning/*: string */, options/*: {id: string}*/)/*: any */ {
  logger.warn(options, warning);
  return deprecatedFunction();
};
