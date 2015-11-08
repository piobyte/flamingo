/* @flow */
var request = require('request'),
  pkg = require('../../package'),
  globalConfig = require('../../config'),
  readerType = require('./reader-type'),
  readAllowed = require('../util/url-access-allowed'),
  noop = require('lodash/utility/noop'),
  deprecate = require('../util/deprecate'),
  errors = require('../util/errors'),
  RSVP = require('rsvp');

var Promise = RSVP.Promise;

/**
 * Reader that creates a stream for a given http/https resource
 * @param {url} fileUrl url to read
 * @param {object} access access configuration object
 * @param {object} config flamingo config
 * @return {promise} resolves with an http(s) read configuration
 */
module.exports = function (fileUrl/*: UrlParse */, access/*: AccessConfig */, config/*: Config */) {
  if (!config) { deprecate(noop, 'Https reader called without passing the flamingo config.', {id: 'no-global-config'}); }

  var conf = config ? config : globalConfig;

  return access.HTTPS.ENABLED && !readAllowed(fileUrl, access.HTTPS.READ) ?
    RSVP.reject('Read not allowed. See `ACCESS.HTTPS.READ` for more information.') :
    RSVP.resolve({
      stream: function () {
        return new Promise(function (resolve, reject) {
          var stream = request({
            url: fileUrl.href,
            timeout: conf.READER.REQUEST.TIMEOUT,
            headers: {'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')'},
            maxRedirects: !conf.ALLOW_READ_REDIRECT ? 0 : 10
          });

          // workaround via http://stackoverflow.com/a/26163128
          stream.pause();
          stream.on('error', function (err) {
            reject(new errors.InvalidInputError(err.message, err));
          });
          stream.on('response', function (response) {
            if (response.statusCode < 400) {
              resolve(stream);
              stream.resume();
            } else {
              stream.destroy();
              reject(new errors.InvalidInputError('http response status ' + response.statusCode, fileUrl.href));
            }
          });
        });
      },
      url: fileUrl,
      type: readerType.REMOTE
    });
};
