import Url = require('url');

import httpsReader = require('../reader/https');
import fileReader = require('../reader/file');
import Reader = require('../types/Reader');
/**
 * @module
 */

const reader = {
  http: httpsReader,
  https: httpsReader,
  file: fileReader
};

/**
 * Tries to find a reader for a given parsed url.
 * @param {Object} parsedUrl object containing a protocol (i.e. result of `url.parse(myUrl)`)
 * @returns {Reader} writer if found, `undefined` otherwise
 * @example
 * readerForUrl('file:///tmp/foo') // data reader
 */
export = function(parsedUrl?: Url.Url): Reader | undefined {
  let foundReader;

  /* istanbul ignore else */
  if (parsedUrl && typeof parsedUrl.protocol === 'string') {
    foundReader =
      reader[parsedUrl.protocol.substring(0, parsedUrl.protocol.length - 1)];
  } else {
    console.log('couldnt find reader');
  }

  return foundReader;
};
