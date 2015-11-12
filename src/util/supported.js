/* @flow */
/**
 * Supported features module
 * @module flamingo/src/util/supported
 */
var RSVP = require('rsvp'),
  temp = require('temp'),
  path = require('path'),
  fs = require('fs'),
  through2 = require('through2'),
  ffmpeg = require('fluent-ffmpeg'),
  FlamingoOperation = require('./flamingo-operation'),
  gmProcessor = require('../processor/image/gm');

var Promise = RSVP.Promise;

/**
 * Function to check if ffmpeg/ffprobe is installed and usable
 * @returns {RSVP.Promise} resolves true or false depending on the ffmpeg/ffprobe support
 */
function hasFFmpeg(/*conf*/) {
  return new Promise(function(resolve){
    ffmpeg.ffprobe(path.join(__dirname, '../../test/fixtures/videos/trailer_1080p.ogg'), function (err) {
      resolve(err ? false : true);
    });
  });
}

/**
 * Function to check if imagemagick webp is supported
 * @param {} conf
 * @returns {RSVP.Promise} resolves true or false depending on the imagemagick webp image support
 * @example
 * supported()
 *   .then((supported) =>
 *     console.log(supported.FFMPEG ? 'ffmpeg is usable' : 'ffmpeg isn\'t usable'))
 */
function hasGmWebp(conf/*: Config */) {
  return new Promise(function (resolve) {
    var resultLength = 0,
      out = temp.createWriteStream(),
      input = fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/base64.png')),
      op = new FlamingoOperation();

    out.on('finish', function () {
      resolve(resultLength > 0);
      out.end();
    });

    try {
      gmProcessor(op, function (pipe) {
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
module.exports = function (conf/*: Config */)/*: function */ {
  var supported/*: SupportedConfig */ = {GM: {WEBP: false}};
  temp.track();

  return RSVP.all([
    hasGmWebp(conf),
    hasFFmpeg(conf)
  ]).then(function (results/*: Array<boolean> */) {
    /*eslint no-sync: 0*/
    temp.cleanupSync();

    supported.GM.WEBP = results[0];
    supported.FFMPEG = results[1];

    return supported;
  });
};
