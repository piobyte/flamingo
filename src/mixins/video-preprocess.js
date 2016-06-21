'use strict';

const videoPreprocessor = require('../preprocessor/video/index');

module.exports = (SuperClass) => {
  /**
   * Mixin that adds a video preprocessor which creates an image from a given video
   * @class
   * @see {@link src/preprocessor/video/index}
   */
  return class VideoPreprocessor extends SuperClass {
    preprocess(operation) {
      return videoPreprocessor(operation);
    }
  };
};
