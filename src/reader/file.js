/* @flow weak */
var fs = require('fs'),
    readerType = require('./reader-type'),
    accessAllowed = require('../util/file-access-allowed'),
    path = require('path'),
    RSVP = require('rsvp');

var exists = function(filePath) {
    return new RSVP.Promise(function (resolve) {
        fs.exists(filePath, function (doesExist) { resolve(doesExist); });
    });
};

module.exports = function (filePath/*: {path: string} */, readWhitelist/*: Array<string>*/) {
    var normPath = path.normalize(filePath.path);
    return RSVP.resolve(accessAllowed(normPath, readWhitelist)).then(function () {
        return exists(normPath).then(function (pathExists) {
            if (!pathExists) {
                throw {
                    statusCode: 404,
                    message: 'Input file not found.',
                    error: 'Input file not found.'
                };
            }
            return {
                stream: function () {
                    return fs.createReadStream(normPath);
                },
                type: readerType.FILE,
                path: normPath
            };
        });
    });
};
