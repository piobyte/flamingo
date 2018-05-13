/**
 * Flamingo response writer
 * @module
 */
import through = require('through2');
import FlamingoOperation = require('../model/flamingo-operation');

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} Function that replies a given stream
 * @param {FlamingoOperation} operation
 */
export = function({ reply, response }: FlamingoOperation) {
  return function(stream) {
    return new Promise(function(resolve, reject) {
      stream.on('error', reject);

      // use through because hapi sometimes didn't trigger the read
      const replyStream = reply(stream.pipe(through()));

      /* istanbul ignore else */
      if (response && response.header) {
        Object.keys(response.header).forEach(property =>
          replyStream.header(property, response.header[property])
        );
      }

      replyStream.on('finish', resolve);
    });
  };
};
