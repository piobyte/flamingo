/* @flow weak */
var fs = require('fs'),
    fileAccessAllowed = require('../util/file-access-allowed'),
    conf = require('../../config'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    RSVP = require('rsvp');

var Promise = RSVP.Promise;

module.exports = function (outputUrl/*: {path: string}*/, reply/*: function*/) {
    return function (stream) {
        var outputPath = path.normalize(outputUrl.path),
            outputDir = path.dirname(outputPath);

        return fileAccessAllowed(path.normalize(outputPath), conf.ACCESS.WRITE).then(function () {
            return new Promise(function (resolve, reject) {
                mkdirp(outputDir, function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        stream.pipe(fs.createWriteStream(outputPath), {
                            end: true
                        });
                        resolve(reply({
                            statusCode: 200,
                            message: outputPath + ' created'
                        }).code(200));
                    }
                });
            });
        });
    };
};
