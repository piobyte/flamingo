/* @flow weak */
/**
 * Flamingo response writer
 * @module flamingo/src/writer/response
 */
var through = require('through2'),
  RSVP = require('rsvp');

/**
 * Creates a function that calls the given reply function with a stream
 * @param {Object} path File path
 * @param {Function} reply Reply function that accepts the stream
 * @param {Object} [options] Additional response options
 * @return {Function} Function that replies a given stream
 */
module.exports = function (path, reply/*: function */, options/*: {header: {[key: string]: string}} */) {
  return function (stream) {
    return new RSVP.Promise(function (resolve, reject) {
      stream.on('error', reject);

      // use through because hapi sometimes didn't trigger the read
      var replyStream = reply(stream.pipe(through()));

      /* istanbul ignore else */
      if (options && options.header) {
        Object.keys(options.header).forEach(function (property) {
          replyStream.header(property, options.header[property]);
        });
      }

      replyStream.on('finish', resolve);
    });
  };
};
