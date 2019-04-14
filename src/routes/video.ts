import VideoPreprocess = require('./../mixins/video-preprocess');
import Image = require('./image');

/**
 * Route that converts a video to an image.
 * The video location is extracted from a request param
 * @class
 * @extends Route
 * @mixes VideoPreprocess
 */
class Video extends VideoPreprocess(Image) {
  /**
   *
   * @param {Config} conf
   * @param {string} [method='GET']
   * @param {string} [path='/video/{profile}/{url}']
   * @param {string} [description='Profile video conversion']
   */
  constructor(
    conf,
    method = 'GET',
    path = '/video/{profile}/{url}',
    description = 'Profile video conversion'
  ) {
    super(conf, method, path, description);
  }
}

export = Video;
