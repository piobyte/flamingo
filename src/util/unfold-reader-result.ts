/**
 * Addon module
 * @module
 */
/**
 * Function to call the stream method of a given input object
 * @param {Object} object object containing a stream function
 * @param {Function} object.stream Function that returns a stream
 * @returns {Stream} stream
 */

import { ReaderResult } from '../types/ReaderResult';
import nodeStream = require('stream');

export = function(object: ReaderResult): Promise<nodeStream.Readable> {
  return object.stream();
};
