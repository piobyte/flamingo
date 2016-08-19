/* @flow */
/**
 * Supported features module
 * @module
 */
const Promise = require('bluebird');
const temp = require('temp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Function to check if ffmpeg/ffprobe is installed and usable
 * @returns {Promise} resolves true or false depending on the ffmpeg/ffprobe support
 */
function hasFFmpeg(/*conf*/) {
  return new Promise((resolve) =>
    ffmpeg.ffprobe(path.join(__dirname, '../../test/fixtures/videos/trailer_1080p.ogg'),
      (err) => resolve(err ? false : true)));
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
    hasFFmpeg(conf)
  ]).then(function ([FFMPEG]/*: Array<boolean> */) {
    /*eslint no-sync: 0*/
    temp.cleanupSync();

    supported.FFMPEG = FFMPEG;

    return supported;
  });
};
