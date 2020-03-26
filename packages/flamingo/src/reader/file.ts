import fs = require("fs");
import path = require("path");

import FlamingoOperation = require("../model/flamingo-operation");
import ReaderType = require("../model/reader-type");
import accessAllowed = require("../util/file-access-allowed");
import errors = require("../util/errors");

const { InvalidInputError } = errors;
const { FILE } = ReaderType;

function fileExists(filePath: string) {
  return new Promise(function (resolve, reject) {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        reject(new InvalidInputError("Input stat error.", err));
      } else {
        if (!stat.isFile()) {
          reject(new InvalidInputError("Input isn't a file.", filePath));
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
export = function (operation: FlamingoOperation) {
  const filePath = operation.input;
  const access = operation.config.ACCESS!;

  const readWhitelist = access.FILE!.READ;
  const normalizedPath = path.normalize(filePath.path);

  if (!accessAllowed(normalizedPath, readWhitelist)) {
    return Promise.reject(
      new InvalidInputError("File access not allowed.", filePath)
    );
  }

  return fileExists(normalizedPath).then(() => ({
    stream: () => fs.createReadStream(normalizedPath),
    type: FILE,
    path: normalizedPath,
  }));
};
