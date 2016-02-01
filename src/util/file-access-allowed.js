/* @flow */
/**
 * File access allowed module
 * @module flamingo/src/util/file-access-allowed
 */
/**
 * Function to ensure that a given file path is whitelisted
 *
 * @param {string} filePath path to check
 * @param {array<string>} allowedPaths path whitelist
 * @return {boolean} true if access allowed, false otherwise
 */
module.exports = function (filePath/*: string*/, allowedPaths/*: Array<string>*/)/*: boolean */ {
  return allowedPaths.some((allowedPath) => filePath.indexOf(allowedPath) === 0);
};
