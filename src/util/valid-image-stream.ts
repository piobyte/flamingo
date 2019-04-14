import fileType = require('file-type');
import peek = require('buffer-peek-stream');
import isStream = require('is-stream');
import errors = require('./errors');
import FlamingoOperation = require('../model/flamingo-operation');
import stream = require('stream');

const { ProcessingError, InvalidInputError } = errors;

export = function(operation?: FlamingoOperation) {
  return async function(stream: stream.Readable) {
    if (!isStream(stream)) throw new ProcessingError('Not a stream');

    return new Promise((resolve, reject) => {
      peek(stream, 256, (err, data, outputStream) => {
        const file = fileType(data);

        if (file && file.mime && file.mime.split('/')[0] === 'image') {
          resolve(outputStream);
        } else {
          outputStream.end('Not an image stream');
          reject(new InvalidInputError('Not an image stream'));
        }
      });
    });
  };
};
