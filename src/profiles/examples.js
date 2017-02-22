/* @flow weak */

/**
 * Example profiles
 * @module
 */

const Promise = require('bluebird');
const sharp = require('sharp');
const envParser = require('../util/env-parser');
const bestFormat = require('../util/best-format');
const clamp = require('clamp');

const MIN_IMAGE_SIZE = 10;
const MAX_IMAGE_SIZE = 1024;

const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

const DEFAULT_AVATAR_SIZE = 170;
const DEFAULT_PREVIEW_IMAGE_SIZE = 200;
const DEFAULT_QUALITY = 80;

const {int, float, objectInt} = envParser;

function extractDimension(query = {}, defaultSize) {
  let width;
  let height;

  const hasHeight = typeof query['height'] === 'string';
  const hasWidth = typeof query['width'] === 'string';

  if (hasWidth && !hasHeight) {
    // ?width=300
    width = clamp(objectInt('width', defaultSize)(query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
    height = width;
  } else if (hasHeight && !hasWidth) {
    // ?height=300
    height = clamp(objectInt('height', defaultSize)(query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
    width = height;
  } else if (hasHeight && hasWidth) {
    // ?height=300&width=300
    width = clamp(objectInt('width', defaultSize)(query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
    height = clamp(objectInt('height', defaultSize)(query), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
  } else {
    // ?
    width = defaultSize;
    height = defaultSize;
  }

  return {width, height};
}

module.exports = {
  /**
   * Avatar image profile
   * @param {Request} request
   * @param {Object} config
   * @return {Promise.<{process: Array}>}
   */
  'avatar-image': function (request, config) {
    let {width, height} = extractDimension(request.query, DEFAULT_AVATAR_SIZE);
    const quality = clamp(objectInt('q', DEFAULT_QUALITY)(request.query), MIN_QUALITY, MAX_QUALITY);

    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader/*: Object */ = config.CLIENT_HINTS ? {'Accept-CH': 'DPR, Width'} : {};

    responseHeader['Content-Type'] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty('dpr')) {
      const dpr = clamp(float(1)(request.headers.dpr), 1, 10);

      responseHeader['Content-DPR'] = dpr;
      responseHeader['Vary'] = request.headers.hasOwnProperty('width') ? 'Width' : 'DPR';

      width = responseHeader['Vary'] === 'DPR' ? width * dpr : clamp(int(width)(request.headers.width), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
      height = responseHeader['Vary'] === 'DPR' ? height * dpr : width;
    }

    return Promise.resolve({
      name: 'avatar-image',
      response: {header: responseHeader},
      process: [{
        processor: 'sharp', pipe: function (pipe) {
          return pipe
            .rotate()
            .toFormat(format.type, {quality})
            .resize(Math.ceil(width), Math.ceil(height))
            .min()
            .crop(sharp.gravity.center);
        }
      }]
    });
  },

  /**
   * Preview image profile
   * @param {Request} request
   * @param {Object} config
   * @return {Promise.<{process: Array}>}
   */
  'preview-image': function (request, config) {
    let {width, height} = extractDimension(request.query, DEFAULT_PREVIEW_IMAGE_SIZE);
    const quality = clamp(objectInt('q', DEFAULT_QUALITY)(request.query), MIN_QUALITY, MAX_QUALITY);

    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader/*: Object */ = config.CLIENT_HINTS ? {'Accept-CH': 'DPR, Width'} : {};

    responseHeader['Content-Type'] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty('dpr')) {
      const dpr = clamp(float(1)(request.headers.dpr), 1, 10);

      responseHeader['Content-DPR'] = dpr;
      responseHeader['Vary'] = request.headers.hasOwnProperty('width') ? 'Width' : 'DPR';

      width = responseHeader['Vary'] === 'DPR' ? width * dpr : clamp(int(width)(request.headers.width), MIN_IMAGE_SIZE, MAX_IMAGE_SIZE);
      height = responseHeader['Vary'] === 'DPR' ? height * dpr : width;
    }

    return Promise.resolve({
      name: 'preview-image',
      response: {header: responseHeader},
      process: [{
        processor: 'sharp', pipe: function (instance) {
          return instance
            .rotate()
            .background('white').flatten()
            .toFormat(format.type, {quality})
            .resize(Math.ceil(width), Math.ceil(height))
            .min()
            .crop(sharp.gravity.center);
        }
      }]
    });
  }
};
