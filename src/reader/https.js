var request = require('request'),
    pkg = require('../../package.json'),
    readerType = require('./reader-type'),
    conf = require('../../config'),
    RSVP = require('rsvp');

module.exports = function (fileUrl/*: {href: string} */) {
    return RSVP.Promise.resolve({
        stream: function () {
            return new RSVP.Promise(function (resolve, reject) {
                var stream = request({
                        url: fileUrl.href,
                        timeout: conf.READER.REQUEST.TIMEOUT,
                        headers: { 'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')' }
                    });

                // workaround via http://stackoverflow.com/a/26163128
                stream.pause();
                stream.on('error', function (err) {
                    err.signal = fileUrl.href;
                    reject(err);
                });
                stream.on('response', function (response) {
                    if (response.statusCode < 400) {
                        resolve(stream);
                        stream.resume();
                    } else {
                        reject(response);
                    }
                });
            });
        },
        type: readerType.REMOTE
    });
};
