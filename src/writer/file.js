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
 * @param {Object} operation
 * @return {Function} function that writes a stream to a given file
 */
module.exports = function (operation/*: FlamingoOperation */) {
  var outputUrl,
    reply,
    conf;

  if (arguments.length === 3) {
    deprecate(noop, 'File writer called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    outputUrl = arguments[0];
    reply = arguments[1];
    conf = arguments[3];
  } else if(arguments.length === 2) {
    deprecate(noop, 'File writer called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    conf = globalConfig;
    outputUrl = arguments[0];
    reply = arguments[1];
  } else {
    outputUrl = operation.targetUrl;
    reply = operation.reply;
    conf = operation.config;
  }

  return function (stream) {
    var outputPath = path.normalize(outputUrl.path),
      outputDir = path.dirname(outputPath);

    return fileAccessAllowed(path.normalize(outputPath), conf.ACCESS.WRITE).then(function () {
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
            writeStream.on('finish', function(){
              resolve(reply({
                statusCode: 200,
                message: outputPath + ' created'
              }).code(200));
            });
          }
        });
      });
    });
  };
};
