var RSVP = require('rsvp'),
    stream = require('stream'),
    readerType = require('./reader-type');

var Readable = stream.Readable;

module.exports = function (url) {
    return new RSVP.Promise(function (resolve, reject) {
        const B64_DELIMITER = 'base64,';

        var type = url.host,
            encoded = url.href.substring(url.href.indexOf(B64_DELIMITER) + B64_DELIMITER.length, url.href.length);

        if (type === 'image') {
            /* eslint new-cap: 0, no-underscore-dangle: 0 */
            // only support image base64 data atm
            var buffer = new Buffer(encoded, 'base64'),
                rs = Readable();

            rs._read = function () {
                // push buffer
                rs.push(buffer);
                // end read stream message
                rs.push(null);
            };

            resolve({
                stream: function () {
                    return rs;
                },
                path: null,
                type: readerType.DATA
            });
        } else {
            reject({
                message: 'unsupported input type: ' + type
            });
        }

    });
};
