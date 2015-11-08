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
 * @return {string} input file path
 * @throws foo
 */
module.exports = function (filePath/*: string*/, allowedPaths/*: Array<string>*/)/*: string */ {
  var validLocation = allowedPaths.some(function (validFile) {
    if (filePath.indexOf(validFile) === 0) {
      return true;
    }
  });
  if (!validLocation) {
    throw {
      statusCode: 403,
      error: 'File access forbidden',
      message: 'File location not allowed. Allowed: ' + JSON.stringify(allowedPaths)
    };
  }
  return filePath;
};
