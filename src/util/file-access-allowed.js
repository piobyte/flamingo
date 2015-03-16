/* @flow weak */
var forEach = require('lodash/collection/forEach'),
    RSVP = require('rsvp');

module.exports = function (filePath/*: string*/, allowedPaths/*: Array<string>*/) {
    return new RSVP.Promise(function (resolve, reject) {
        var validLocation = false;
        forEach(allowedPaths, function (validFile) {
            if (filePath.indexOf(validFile) === 0) {
                validLocation = true;
                return false;
            }
        });
        if (validLocation) {
            resolve(filePath);
        } else {
            reject({
                statusCode: 403,
                error: 'File access forbidden',
                message: 'File location not allowed. Allowed: ' + JSON.stringify(allowedPaths)
            });
        }
    });
};
