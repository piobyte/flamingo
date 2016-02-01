'use strict';

const VideoPreprocess = require('./../mixins/video-preprocess');
const Image = require('./image');

/**
 * Video is a image route that runs a video image extraction preprocessor.
 */
class Video extends VideoPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/video/{profile}/{url}', description = 'Profile video conversion') {
    super(conf, method, path, description);
  }
}

module.exports = Video;

