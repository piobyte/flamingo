var request = require('request'),
    pkg = require('../../package.json'),
    readerType = require('./reader-type'),
    RSVP = require('rsvp');

module.exports = function (fileUrl) {
    return new RSVP.Promise(function (resolve) {
        resolve({
            stream: function () {
                return request({
                    url: fileUrl.href,
                    headers: {
                        'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')'
                    }
                });
            },
            type: readerType.REMOTE
        });
    });
};
