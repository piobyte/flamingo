/* @flow weak */
var fs = require('fs'),
  readerType = require('./reader-type'),
  accessAllowed = require('../util/file-access-allowed'),
  path = require('path'),
  noop = require('lodash/noop'),
  deprecate = require('../util/deprecate'),
  RSVP = require('rsvp');

var exists = function (filePath/*: string */) {
  return new RSVP.Promise(function (resolve) {
    fs.exists(filePath, function (doesExist) {
      resolve(doesExist);
    });
  });
};

/**
 * Function that resolves a read configuration for a given file
 * @param {Object} operation
 * @return {Promise} resolves with the file read configuration
 */
module.exports = function (operation/*: FlamingoOperation */) {
  var filePath,
    access;

  if (arguments.length === 2) {
    deprecate(noop, 'File reader called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    filePath = arguments[0];
    access = arguments[1];
  } else {
    filePath = operation.targetUrl;
    access = operation.config.ACCESS;
  }

  var readWhitelist = access.FILE.READ,
    normPath = path.normalize(filePath.path);

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
