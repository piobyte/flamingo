/* @flow weak */
/**
 * Flamingo response writer
 * @module flamingo/src/writer/response
 */
var through = require('through2'),
  deprecate = require('../util/deprecate'),
  noop = require('lodash/utility/noop'),
  RSVP = require('rsvp');

/**
 * Creates a function that calls the given reply function with a stream
 * @param {Object} operation flamingo operation
 * @return {Function} Function that replies a given stream
 */
module.exports = function (operation) {
  var reply,
    options;

  if (arguments.length === 3) {
    deprecate(noop, 'Response writer called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    reply = arguments[1];
    options = arguments[2];
  } else {
    reply = operation.reply;
    options = operation.profile.response;
  }

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
