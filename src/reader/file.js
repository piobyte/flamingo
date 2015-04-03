/* @flow weak */
var fs = require('fs'),
    readerType = require('./reader-type'),
    accessAllowed = require('../util/file-access-allowed'),
    path = require('path'),
    RSVP = require('rsvp');

module.exports = function (filePath/*: {path: string} */, readWhitelist/*: Array<string>*/) {
    var normPath = path.normalize(filePath.path);
    return accessAllowed(normPath, readWhitelist).then(function () {
        return new RSVP.Promise(function (resolve, reject) {
            fs.exists(normPath, function (exists) {
                if (exists) {
                    resolve({
                        stream: function () {
                            return fs.createReadStream(normPath);
                        },
                        type: readerType.FILE,
                        path: normPath
                    });
                } else {
                    reject({
                        statusCode: 404,
                        message: 'Input file not found.',
                        error: 'Input file not found.'
                    });
                }
            });
        });
    });
};
