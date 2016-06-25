'use strict';

const validImageStream = require('../util/valid-image-stream');

module.exports = (SuperClass) => {
  /**
   * Mixin that adds a validStream method to check that the incoming process stream is an image.
   * @mixin
   */
  class ImageStream extends SuperClass {
    /**
     * Validates read stream to be a valid image
     * @param {FlamingoOperation} op
     * @returns {Promise}
     */
    validStream(op) {
      return validImageStream(op);
    }
  }

  return ImageStream;
};
