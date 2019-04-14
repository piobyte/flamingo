import fs = require('fs');
import path = require('path');

import FlamingoOperation = require('../model/flamingo-operation');
import ReaderType = require('../model/reader-type');
import accessAllowed = require('../util/file-access-allowed');
import errors = require('../util/errors');

const { InvalidInputError } = errors;
const { FILE } = ReaderType;

/**
 * Function that resolves a read configuration for a given file
 * @param {Object} operation
 * @return {Promise} resolves with the file read configuration
 */
export = async function(operation: FlamingoOperation) {
  const {
    config: { ACCESS },
    input: filePath
  } = operation;

  const normalizedPath = path.normalize(filePath.path);

  if (!accessAllowed(normalizedPath, ACCESS!.FILE!.READ)) {
    throw new InvalidInputError(`File access not allowed: ${filePath}`);
  }

  await fs.promises.access(normalizedPath, fs.constants.R_OK);

  return {
    stream: () => fs.createReadStream(normalizedPath),
    type: FILE,
    path: normalizedPath
  };
};
