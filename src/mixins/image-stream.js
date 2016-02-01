'use strict';

const validImageStream = require('../util/valid-image-stream');

module.exports = (SuperClass) => {
  return class ImageStream extends SuperClass {
    validStream(op) {
      return validImageStream(op);
    }
  };
};
