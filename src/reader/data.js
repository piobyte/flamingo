/* @flow weak */
var RSVP = require('rsvp'),
    stream = require('stream'),
    readerType = require('./reader-type');

var B64_DELIMITER = 'base64,';

/**
 * Reader that creates a stream from a file that is located at a base64 encoded path
 * @param {object} url data url
 * @returns {Promise} promise that resolves thee stream object
 */
module.exports = function (url/*: {host: string, href: string} */) {
    var type = url.host,
        encoded = url.href.substring(url.href.indexOf(B64_DELIMITER) + B64_DELIMITER.length, url.href.length),
        promise;

    if (type === 'image') {
        /* eslint new-cap: 0, no-underscore-dangle: 0 */
        // only support image base64 data atm
        var buffer = new Buffer(encoded, 'base64'),
            rs = stream.Readable();

        rs._read = function () {
            // push buffer
            rs.push(buffer);
            // end read stream message
            rs.push(null);
        };

        promise = RSVP.resolve({
            stream: function () {
                return RSVP.resolve(rs);
            },
            path: null,
            type: readerType.DATA
        });
    } else {
        promise = RSVP.reject({
            message: 'unsupported input type: ' + type
        });
    }

    return promise;
};
