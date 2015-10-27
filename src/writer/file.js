/* @flow weak */
/**
 * Flamingo file writer
 * @module flamingo/src/writer/file
 */
var fs = require('fs'),
  fileAccessAllowed = require('../util/file-access-allowed'),
  mkdirp = require('mkdirp'),
  path = require('path'),
  noop = require('lodash/utility/noop'),
  globalConfig = require('../../config'),
  deprecate = require('../util/deprecate'),
  RSVP = require('rsvp');

var Promise = RSVP.Promise;

/**
 * Creates a function that calls the given reply function with a stream
 * @param {{path: string}} outputUrl Output url
 * @param {function} reply Function that replies a given stream
 * @param {Object} [options] Additional response options
 * @param {Object} config flamingo config
 * @return {Function} function that writes a stream to a given file
 */
module.exports = function (outputUrl/*: {path: string}*/, reply/*: function*/, options/*: {header: {[key: string]: string}} */, config/*: {ACCESS: {WRITE: any}} */) {
  if (!config) { deprecate(noop, 'Calling a writer processor without passing the flamingo config is deprecated. Pass the flamingo config as 3rd parameter.', {id: 'no-global-config'}); }
  var conf = config ? config : globalConfig;

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
