/* @flow weak */
/**
 * File access allowed module
 * @module flamingo/src/util/file-access-allowed
 */
var forEach = require('lodash/collection/forEach');

/**
 * Function to ensure that a given file path is whitelisted
 *
 * @param {string} filePath path to check
 * @param {array<string>} allowedPaths path whitelist
 * @return {string} input file path
 * @throws foo
 */
module.exports = function (filePath/*: string*/, allowedPaths/*: Array<string>*/)/*: string */ {
    var validLocation = false;
    forEach(allowedPaths, function (validFile) {
        if (filePath.indexOf(validFile) === 0) {
            validLocation = true;
            return false;
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
