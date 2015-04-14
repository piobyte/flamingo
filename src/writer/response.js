var through = require('through2');

/**
 * Creates a function that calls the given reply function with a stream
 * @param {Object} path File path
 * @param {Function} reply Reply function that accepts the stream
 * @param {Object} [options] Additional response options
 * @return {Function} Function that replies a given stream
 */
module.exports = function (path, reply, options) {
    return function (stream) {
        // use through because hapi sometimes didn't trigger the read
        var r = reply(stream.pipe(through()));
        if (options && options.header) {
            Object.keys(options.header).forEach(function (property) {
                r.header(property, options.header[property]);
            });
        }
        return r;
    };
};
