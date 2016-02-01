/* @flow weak */
/**
 * Flamingo file writer
 * @module flamingo/src/writer/file
 */
const fs = require('fs');
const fileAccessAllowed = require('../util/file-access-allowed');
const errors = require('../util/errors');
const mkdirp = require('mkdirp');
const path = require('path');
const Promise = require('bluebird');

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} function that writes a stream to a given file
 */
module.exports = function ({targetUrl, reply, config}/*: FlamingoOperation */) {
  return function (stream) {
    const outputPath = path.normalize(targetUrl.path);
    const outputDir = path.dirname(outputPath);
    const allowed = fileAccessAllowed(path.normalize(outputPath), config.ACCESS.FILE.WRITE);

    if (!allowed) {
      return Promise.reject(new errors.InvalidInputError('File access not allowed', outputPath));
    }

    return new Promise(function (resolve, reject) {
      mkdirp(outputDir, function (err) {
        if (err) {
          reject(err);
        } else {
          stream.on('error', reject);
          var writeStream = stream.pipe(fs.createWriteStream(outputPath), {
            end: true
          });
          writeStream.on('error', reject);
          writeStream.on('finish', function () {
            resolve(reply({
              statusCode: 200,
              message: outputPath + ' created'
            }).code(200));
          });
        }
      });
    });
  };
};
