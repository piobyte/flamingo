/**
 * Flamingo response writer
 * @module
 */
import through = require('through2');
import Promise = require('bluebird');
import peek = require('buffer-peek-stream');
import FlamingoOperation = require('../model/flamingo-operation');

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} Function that replies a given stream
 * @param {FlamingoOperation} operation
 */
export = function({ reply, response }: FlamingoOperation) {
  return function(stream) {
    const replyPromise = new Promise(function(resolve, reject) {
      stream.on('error', reject);

      peek(stream.pipe(through()), 42, function(err, data, outputStream) {
        if (!replyPromise.isRejected()) {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            // use through because hapi sometimes didn't trigger the read
            const replyStream = reply(outputStream);

            /* istanbul ignore else */
            if (response && response.header) {
              Object.keys(response.header).forEach(property =>
                replyStream.header(property, response.header[property])
              );
            }

            replyStream.on('finish', resolve);
          }
        }
      });
    });
    return replyPromise;
  };
};
