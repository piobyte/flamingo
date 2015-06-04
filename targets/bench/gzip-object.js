var zlib = require('zlib'),
    RSVP = require('rsvp');

function gzip(obj) {
    return new RSVP.Promise(function (resolve, reject) {
        zlib.gzip(new Buffer(JSON.stringify(obj), 'utf-8'), function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = gzip;
