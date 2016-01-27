/* disabled flow because of deprecated signature type mismatch */
var request = require('request'),
  pkg = require('../../package'),
  globalConfig = require('../../config'),
  readerType = require('./reader-type'),
  readAllowed = require('../util/url-access-allowed'),
  noop = require('lodash/noop'),
  deprecate = require('../util/deprecate'),
  errors = require('../util/errors'),
  RSVP = require('rsvp');

var Promise = RSVP.Promise;

/**
 * Reader that creates a stream for a given http/https resource
 * @param {object} operation flamingo process operation
 */
module.exports = function (operation/*: FlamingoOperation */) {
  var conf,
    fileUrl,
    access;

  if (arguments.length === 3) {
    // signature:  fileUrl/*: UrlParse */, access/*: AccessConfig */, config/*: Config */
    deprecate(noop, 'Https reader called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    fileUrl = arguments[0];
    access = arguments[1];
    conf = arguments[2];
  } else if(arguments.length === 2) {
    // signature: fileUrl/*: UrlParse */, access/*: AccessConfig */
    deprecate(noop, 'Https reader called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    fileUrl = arguments[0];
    access = arguments[1];
    conf = globalConfig;
  } else {
    conf = operation.config;
    fileUrl = operation.targetUrl;
    access = conf.ACCESS;
  }

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
