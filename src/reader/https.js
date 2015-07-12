var request = require('request'),
    pkg = require('../../package.json'),
    readerType = require('./reader-type'),
    readAllowed = require('../util/url-access-allowed'),
    conf = require('../../config'),
    RSVP = require('rsvp');

var Promise = RSVP.Promise;

module.exports = function (fileUrl/*: {href: string} */, access/*: {HTTPS: {ENABLED: boolean, READ: Array<{}>, WRITE: Array<{}>}}*/) {
    return access.HTTPS.ENABLED && !readAllowed(fileUrl, access.HTTPS.READ) ?
        RSVP.reject('Read not allowed. See `ACCESS.HTTPS.READ` for more information.', fileUrl) :
        RSVP.resolve({
            stream: function () {
                return new Promise(function (resolve, reject) {
                    var stream = request({
                        url: fileUrl.href,
                        timeout: conf.READER.REQUEST.TIMEOUT,
                        headers: {'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')'},
                        followRedirect: conf.ALLOW_READ_REDIRECT
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
                            stream.destroy();
                            reject(response);
                        }
                    });
                });
            },
            url: fileUrl,
            type: readerType.REMOTE
        });
};
