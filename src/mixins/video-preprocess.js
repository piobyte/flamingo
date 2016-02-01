'use strict';

const videoPreprocessor = require('../preprocessor/video/index');

module.exports = (SuperClass) => {
  return class VideoPreprocessor extends SuperClass {
    preprocess(operation) {
      return videoPreprocessor(operation);
    }
  };
};
