/* @flow weak */
const fs = require('fs');
const {FILE} = require('../model/reader-type');
const accessAllowed = require('../util/file-access-allowed');
const path = require('path');
const Promise = require('bluebird');
const {InvalidInputError} = require('../util/errors');

function fileExists(filePath/*: string */) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        reject(new InvalidInputError('Input stat error.', err));
      } else {
        if (!stat.isFile()) {
          reject(new InvalidInputError('Input isn\'t a file.', filePath));
        } else {
          resolve();
        }
      }
    });
  });
}

/**
 * Function that resolves a read configuration for a given file
 * @param {Object} operation
 * @return {Promise} resolves with the file read configuration
 */
module.exports = function (operation/*: FlamingoOperation */) {
  const filePath = operation.input;
  const access = operation.config.ACCESS;

  const readWhitelist = access.FILE.READ;
  const normalizedPath = path.normalize(filePath.path);

  if (!accessAllowed(normalizedPath, readWhitelist)) {
    return Promise.reject(new InvalidInputError('File access not allowed.', filePath));
  }

  return fileExists(normalizedPath).then(() => ({
    stream: () => fs.createReadStream(normalizedPath),
    type: FILE,
    path: normalizedPath
  }));
};
