/* @flow weak */
/**
 * @module flamingo/src/profiles/debug
 */
const Promise = require('bluebird');
const sharp = require('sharp');
const bestFormat = require('../util/best-format');
const clamp = require('clamp');
const envParser = require('../util/env-parser');

/**
 * Debug profiles that choose a processor based on the `processor` query param
 */
var profiles = {
  'debug-rotate': function (request, config) {
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
            .rotate('white', 270)
            .background('white')
            .resize(dim, dim + '^')
            .gravity('Center')
            .extent(dim, dim)
            .setFormat(format.type);
        }
      });
    } else {
      process.push({
        processor: 'sharp', pipe: function (pipe) {
          return pipe.rotate(270)
            .resize(dim, dim)
            .background('white')
            .flatten()
            .toFormat(format.type);
        }
      });
    }

    return Promise.resolve({response: {header: {'Content-Type': format.mime}}, process: process});
  },
  'debug-resize': function (request, config) {
    const dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024);
    const process = [];
    let format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === 'gm') {
      process.push({
        processor: 'gm', pipe: function (pipe) {
          if (format.type === 'webp') {
            pipe = pipe.options({imageMagick: true});
          }
          return pipe.resize(dim, dim + '^').gravity('Center').extent(dim, dim).setFormat(format.type);
        }
      });
    } else {
      process.push({
        processor: 'sharp', pipe: function (pipe) {
          return pipe.resize(dim, dim).background('white').flatten().toFormat(format.type);
        }
      });
    }

    // override dimension with query.width
    return Promise.resolve({process: process});
  },
  'debug-flip': function (request, config) {
    const dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024);
    const process = [];
    let format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === 'gm') {
      process.push({
        processor: 'gm', pipe: function (pipe) {
          if (format.type === 'webp') {
            pipe = pipe.options({imageMagick: true});
          }
          return pipe.flip().resize(dim, dim + '^').gravity('Center').extent(dim, dim).setFormat(format.type);
        }
      });
    } else {
      process.push({
        processor: 'sharp', pipe: function (pipe) {
          return pipe.flip()
            .background('white').flatten()
            .resize(dim, dim).toFormat(format.type);
        }
      });
    }

    return Promise.resolve({process: process});
  },
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

module.exports = profiles;
