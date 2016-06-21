/* disabled flow because of deprecated signature type mismatch */
const pkg = require('../../package');
const {REMOTE} = require('../model/reader-type');
const readAllowed = require('../util/url-access-allowed');
const got = require('got');
const {InvalidInputError} = require('../util/errors');
const Promise = require('bluebird');

/**
 * Reader that creates a stream for a given http/https resource
 * @param {object} operation flamingo process operation
 */
module.exports = function (operation/*: FlamingoOperation */) {
  const conf = operation.config;
  const input = operation.input;
  const access = conf.ACCESS;

  return access.HTTPS.ENABLED && !readAllowed(input, access.HTTPS.READ) ?
    Promise.reject('Read not allowed. See `ACCESS.HTTPS.READ` for more information.') :
    Promise.resolve({
      stream: function () {
        return new Promise(function (resolve, reject) {
          const stream = got.stream(input.href, {
            timeout: conf.READER.REQUEST.TIMEOUT,
            followRedirect: conf.ALLOW_READ_REDIRECT,
            headers: {'user-agent': `${pkg.name}/${pkg.version} (${pkg.bugs.url})`}
          });
          stream.on('error', function (err) {
            reject(new InvalidInputError('http response status ' + err.statusCode, input.href));
          });
          stream.on('response', function () {
            resolve(stream);
          });
        });
      },
      url: input,
      type: REMOTE
    });
};
