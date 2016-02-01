/* @flow */
/**
 * Supported features module
 * @module flamingo/src/util/supported
 */
const Promise = require('bluebird');
const temp = require('temp');
const path = require('path');
const fs = require('fs');
const through2 = require('through2');
const ffmpeg = require('fluent-ffmpeg');
const FlamingoOperation = require('./../model/flamingo-operation');
const gmProcessor = require('../processor/image/gm');

/**
 * Function to check if ffmpeg/ffprobe is installed and usable
 * @returns {RSVP.Promise} resolves true or false depending on the ffmpeg/ffprobe support
 */
function hasFFmpeg(/*conf*/) {
  return new Promise((resolve) =>
    ffmpeg.ffprobe(path.join(__dirname, '../../test/fixtures/videos/trailer_1080p.ogg'),
      (err) => resolve(err ? false : true)));
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
    let resultLength = 0;
    const out = temp.createWriteStream();
    const input = fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/base64.png'));
    const op = new FlamingoOperation();

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
  const supported/*: SupportedConfig */ = {GM: {WEBP: false}};
  temp.track();

  return Promise.all([
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
