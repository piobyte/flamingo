/* @flow weak */
/**
 * @module
 */

const reader = {
  file: require('../reader/file'),
  http: require('../reader/https'),
  https: require('../reader/https')
};

/**
 * Tries to find a reader for a given parsed url.
 * @param {Object} parsedUrl object containing a protocol (i.e. result of `url.parse(myUrl)`)
 * @returns {String|undefined} writer if found, `undefined` otherwise
 * @example
 * readerForUrl('file:///tmp/foo') // data reader
 */
module.exports = function (parsedUrl/*: {protocol: ?string} */)/*: ?function */ {
  let foundReader;

  /* istanbul ignore else */
  if (typeof parsedUrl.protocol === 'string') {
    foundReader = reader[parsedUrl.protocol.substring(0, parsedUrl.protocol.length - 1)];
  }

  return foundReader;
};
