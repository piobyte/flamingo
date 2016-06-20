/* @flow weak */
const Promise = require('bluebird');
const sharp = require('sharp');
const envParser = require('../util/env-parser');
const bestFormat = require('../util/best-format');
const clamp = require('clamp');

const MIN_IMAGE_SIZE = 10;
const MAX_IMAGE_SIZE = 1024;

function clientHintedDimension(requestHeaders, responseHeaders, width) {
  var dpr = clamp(envParser.float(1)(requestHeaders.dpr), 1, 10);

  responseHeaders['Content-DPR'] = dpr;
  responseHeaders['Vary'] = requestHeaders.hasOwnProperty('width') ? 'Width' : 'DPR';

  return responseHeaders['Vary'] === 'DPR' ? width * dpr :
    clamp(envParser.int(width)(requestHeaders.width), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
}

module.exports = {
  'avatar-image': function (request, config) {
    // override dimension with query.width
    let dim = clamp(envParser.objectInt('width', 170)(request.query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader/*: Object */ = config.CLIENT_HINTS ? {'Accept-CH': 'DPR, Width'} : {};

    responseHeader['Content-Type'] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty('dpr')) {
      dim = clientHintedDimension(request.headers, responseHeader, dim);
    }

    return Promise.resolve({
      name: 'avatar-image',
      response: {header: responseHeader},
      process: [{
        processor: 'sharp', pipe: function (pipe) {
          return pipe
            .rotate()
            .toFormat(format.type)
            .resize(dim, dim)
            .min()
            .crop(sharp.gravity.center);
        }
      }]
    });
  },

  'preview-image': function (request, config) {
    // override dimension with query.width
    let dim = clamp(envParser.objectInt('width', 200)(request.query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader/*: Object */ = config.CLIENT_HINTS ? {'Accept-CH': 'DPR, Width'} : {};

    responseHeader['Content-Type'] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty('dpr')) {
      dim = clientHintedDimension(request.headers, responseHeader, dim);
    }

    return Promise.resolve({
      name: 'preview-image',
      response: {header: responseHeader},
      process: [{
        processor: 'sharp', pipe: function (instance) {
          return instance
            .rotate()
            .background('white').flatten()
            .toFormat(format.type)
            .resize(dim, dim)
            .min()
            .crop(sharp.gravity.center);
        }
      }]
    });
  }
};
