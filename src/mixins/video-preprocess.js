'use strict';

const videoPreprocessor = require('../preprocessor/video/index');

module.exports = (SuperClass) => {
  /**
   * Mixin that adds a video preprocessor which creates an image from a given video
   * @mixin
   */
  class VideoPreprocess extends SuperClass {
    /**
     * Adds video preprocessor
     * @param operation
     * @see module:flamingo/src/preprocessor/video
       */
    preprocess(operation) {
      return videoPreprocessor(operation);
    }
  }

  return VideoPreprocess;
};
