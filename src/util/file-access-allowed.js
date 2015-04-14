/* @flow weak */
var forEach = require('lodash/collection/forEach');

module.exports = function (filePath/*: string*/, allowedPaths/*: Array<string>*/) {
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
