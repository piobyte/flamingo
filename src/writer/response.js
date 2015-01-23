var RSVP = require('rsvp');

/**
 * Creates a function that calls the given reply function with a stream
 * @param {Object} path File path
 * @param {Function} reply Reply function that accepts the stream
 * @param {Object} [options] Additional response options
 * @return {Function} Function that replies a given stream
 */
module.exports = function (path, reply, options) {
    return function (stream) {
        return new RSVP.Promise(function (resolve) {
            if (options && options.header) {
                var replyChain = reply(stream);
                Object.keys(options.header).forEach(function (property) {
                   replyChain.header(property, options.header[property]);
                });
                resolve(replyChain);
            } else {
                resolve(reply(stream));
            }
        });
    };
};
