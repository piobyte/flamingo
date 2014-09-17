var RSVP = require('rsvp');

/**
 * Creates a function that calls the given reply function with a stream
 * @param {Object} path File path
 * @param {Function} reply Reply function that accepts the stream
 * @return {Function} Function that replies a given stream
 */
module.exports = function (path, reply) {
    return function (stream) {
        return new RSVP.Promise(function (resolve) {
            resolve(reply(stream));
        });
    };
};
