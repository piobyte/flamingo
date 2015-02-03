var request = require('request'),
    pkg = require('../../package.json'),
    readerType = require('./reader-type'),
    conf = require('../../config'),
    RSVP = require('rsvp');

module.exports = function (fileUrl) {
    return new RSVP.Promise(function (resolve) {
        resolve({
            stream: function () {
                return new RSVP.Promise(function (resolve, reject) {
                    var buf = [],
                        stream = request({
                            url: fileUrl.href,
                            timeout: conf.READER.REQUEST.TIMEOUT,
                            headers: {
                                'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')'
                            }
                        });
                    stream.on('data', function (data) { buf.push(data); });
                    stream.on('error', function (err) { reject(err); });
                    stream.on('end', function () { resolve(Buffer.concat(buf)); });
                });
            },
            type: readerType.REMOTE
        });
    });
};
