/* disabled flow because of deprecated signature type mismatch */
var RSVP = require('rsvp'),
  stream = require('stream'),
  noop = require('lodash/noop'),
  deprecate = require('../util/deprecate'),
  readerType = require('./reader-type');

var B64_DELIMITER = 'base64,';

function _isUrl(url/*: any */)/*: boolean */ {
  return url && url.hasOwnProperty('protocol');
}

/**
 * Reader that creates a stream from a file that is located at a base64 encoded path
 * @returns {Promise} promise that resolves thee stream object
 * @param {Object} operation
 */
module.exports = function (operation/*: FlamingoOperation */) {
  var url;

  if (_isUrl(operation)) {
    deprecate(noop, 'Data reader called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    url = operation;
  } else {
    url = operation.targetUrl;
  }

  var type = url.host,
    encoded = url.href.substring(url.href.indexOf(B64_DELIMITER) + B64_DELIMITER.length, url.href.length),
    promise;

  if (type === 'image' || type === 'video') {
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
