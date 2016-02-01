/* disabled flow because of deprecated signature type mismatch */
const Promise = require('bluebird');
const stream = require('stream');
const readerType = require('./reader-type');

const B64_DELIMITER = 'base64,';

/**
 * Reader that creates a stream from a file that is located at a base64 encoded path
 * @returns {Promise} promise that resolves thee stream object
 * @param {Object} operation
 */
module.exports = function (operation/*: FlamingoOperation */) {
  const url = operation.targetUrl;
  const type = url.host;
  const encoded = url.href.substring(url.href.indexOf(B64_DELIMITER) + B64_DELIMITER.length, url.href.length);
  let promise;

  if (type === 'image' || type === 'video') {
    /* eslint new-cap: 0, no-underscore-dangle: 0 */
    // only support image base64 data atm
    promise = Promise.resolve({
      stream: function () {
        const buffer = new Buffer(encoded, 'base64');
        const rs = stream.Readable();

        rs._read = function () {
          // push buffer
          rs.push(buffer);
          // end read stream message
          rs.push(null);
        };
        return Promise.resolve(rs);
      },
      path: null,
      type: readerType.DATA
    });
  } else {
    promise = Promise.reject({
      message: 'unsupported input type: ' + type
    });
  }

  return promise;
};
