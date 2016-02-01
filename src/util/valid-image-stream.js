const Promise = require('bluebird');
const fileType = require('file-type');
const peek = require('buffer-peek-stream');
const isStream = require('is-stream');
const errors = require('./errors');

module.exports = function () {
  return function (stream) {
    return !isStream(stream) ?
      Promise.reject(new errors.ProcessingError('Not a stream')) :
      new Promise((resolve, reject) => {
        peek(stream, 256, (err, data, outputStream) => {
          const file = fileType(data);

          if (file && file.mime && file.mime.split('/')[0] === 'image') {
            resolve(outputStream);
          } else {
            reject(new errors.InvalidInputError('Not an image stream'));
          }
        });
      });
  };
};
