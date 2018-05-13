import fileType = require('file-type');
import peek = require('buffer-peek-stream');
import isStream = require('is-stream');
import errors = require('./errors');
import FlamingoOperation = require('../model/flamingo-operation');

const { ProcessingError, InvalidInputError } = errors;

export = function(operation?: FlamingoOperation) {
  return function(stream) {
    return !isStream(stream)
      ? Promise.reject(new ProcessingError('Not a stream'))
      : new Promise((resolve, reject) => {
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
