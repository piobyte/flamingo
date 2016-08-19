const Promise = require('bluebird');
const fileType = require('file-type');
const peek = require('buffer-peek-stream');
const isStream = require('is-stream');
const {ProcessingError, InvalidInputError} = require('./errors');

module.exports = function () {
  /**
   * Function that checks if a given stream is an image stream
   */
  return function (stream) {
    return !isStream(stream) ?
      Promise.reject(new ProcessingError('Not a stream')) :
      new Promise((resolve, reject) => {
        peek(stream, 256, (err, data, outputStream) => {
          const file = fileType(data);

          if (file && file.mime && file.mime.split('/')[0] === 'image') {
            resolve(outputStream);
          } else {
            reject(new InvalidInputError('Not an image stream'));
          }
        });
      });
  };
};
