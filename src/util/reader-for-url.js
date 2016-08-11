/* @flow weak */
/**
 * @module
 */

const reader = {
  file: require('../reader/file'),
  data: require('../reader/data'),
  http: require('../reader/https'),
  https: require('../reader/https')
};

/**
 * Tries to find a reader for a given parsed url.
 * @param {Object} parsedUrl object containing a protocol (i.e. result of `url.parse(myUrl)`)
 * @returns {String|undefined} writer if found, `undefined` otherwise
 * @example
 * readerForUrl('data:text/plain;base64,ZGF0YQ==') // data reader
 */
module.exports = function (parsedUrl/*: {protocol: ?string} */)/*: ?function */ {
  let foundReader;

  /* istanbul ignore else */
  if (typeof parsedUrl.protocol === 'string') {
    foundReader = reader[parsedUrl.protocol.substring(0, parsedUrl.protocol.length - 1)];
  }

  return foundReader;
};
