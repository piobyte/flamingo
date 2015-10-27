/* @flow weak */
/**
 * Supported features module
 * @module flamingo/src/util/supported
 */
var RSVP = require('rsvp'),
  temp = require('temp'),
  path = require('path'),
  fs = require('fs'),
  through2 = require('through2'),
  gmProcessor = require('../processor/image/gm');

var Promise = RSVP.Promise;

function hasGmWebp(conf) {
  return new Promise(function (resolve) {
    var resultLength = 0,
      out = temp.createWriteStream(),
      input = fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/base64.png'));

    out.on('finish', function () {
      resolve(resultLength > 0);
      out.end();
    });

    try {
      gmProcessor(function (pipe) {
        return pipe.options({imageMagick: true}).setFormat('webp');
      }, input, conf).pipe(through2(function (chunk, enc, callback) {
        resultLength += chunk.length;
        this.push(chunk);
        callback();
      })).pipe(out);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Function to check if defined features are supported.
 * @return {Promise} promise that resolves with an object that contains supported feature flags
 * @example
 * supported()
 *   .then((supported) =>
 *     console.log(supported.GM.WEBP ? 'webp is supported for gm processor' : 'webp not supported for gm processor'))
 */
module.exports = function (conf)/*: function */ {
  var supported = {GM: {}};
  temp.track();

  return RSVP.all([
    hasGmWebp(conf)
  ]).then(function (results) {
    /*eslint no-sync: 0*/
    temp.cleanupSync();

    supported.GM.WEBP = results[0];

    return supported;
  });
};
