/* @flow weak */
/**
 * Debug profiles that choose a processor based on the `processor` query param
 * @module flamingo/src/profiles/debug
 */
const Promise = require('bluebird');
const sharp = require('sharp');
const bestFormat = require('../util/best-format');
const clamp = require('clamp');
const envParser = require('../util/env-parser');

module.exports = {
  /**
   * Same as example preview image profile, with additional option to set processor with the `processor` query param.
   * @param {Request} request
   * @param {Object} config
   * @see module:flamingo/src/profiles/examples
   * @return {Promise.<{process: Array}>}
   */
  'debug-preview-image': function (request, config) {
    const dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024);
    const process = [];
    let format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === 'gm') {
      process.push({
        processor: 'gm', pipe: function (pipe) {
          // if (format.type === 'webp') {
          pipe = pipe.options({imageMagick: true});
          // }

          return pipe.autoOrient()
            .setFormat(format.type)
            .resize(dim, dim + '^')
            .background('white')
            .flatten()
            .gravity('Center')
            .extent(dim, dim);
        }
      });
    } else {
      process.push({
        processor: 'sharp', pipe: function (pipe) {

          return pipe
            .rotate()
            .background('white').flatten()
            .toFormat(format.type)
            .resize(dim, dim)
            .min()
            .crop(sharp.gravity.center);
        }
      });
    }

    return Promise.resolve({process: process});
  },
  /**
   * Same as examples avatar-image profile, with additional option to set processor with the `processor` query param.
   * @param request
   * @param config
   * @see module:flamingo/src/profiles/examples
   * @return {Promise.<{process: Array}>}
   */
  'debug-avatar-image': function (request, config) {
    const dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024);
    const process = [];
    let format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === 'gm') {
      process.push({
        processor: 'gm', pipe: function (pipe) {
          if (format.type === 'webp') {
            pipe = pipe.options({imageMagick: true});
          }
          return pipe
            .autoOrient()
            .setFormat(format.type)
            .resize(dim, dim + '^')
            .background('transparent')
            .gravity('Center')
            .extent(dim, dim);
        }
      });
    } else {
      process.push({
        processor: 'sharp', pipe: function (pipe) {
          return pipe
            .rotate()
            .toFormat(format.type)
            .resize(dim, dim)
            .min()
            .crop(sharp.gravity.center);
        }
      });
    }

    return Promise.resolve({process: process});
  }
};
