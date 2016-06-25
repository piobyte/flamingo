/* @flow weak */
/**
 * Flamingo response writer
 * @module flamingo/src/writer/response
 */
const through = require('through2');
const Promise = require('bluebird');

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} Function that replies a given stream
 * @param {FlamingoOperation} operation
 */
module.exports = function ({reply, profile:{response}}) {
  return function (stream) {
    return new Promise(function (resolve, reject) {
      stream.on('error', reject);

      // use through because hapi sometimes didn't trigger the read
      var replyStream = reply(stream.pipe(through()));

      /* istanbul ignore else */
      if (response && response.header) {
        Object.keys(response.header).forEach((property) =>
          replyStream.header(property, response.header[property]));
      }

      replyStream.on('finish', resolve);
    });
  };
};
