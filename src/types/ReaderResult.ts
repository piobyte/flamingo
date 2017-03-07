import nodeStream = require('stream');
import Promise = require('bluebird');

/**
 * Object that represents a reader result.
 */
export interface ReaderResult {
  stream: () => Promise<nodeStream.Readable>;
  type: string;
  [field: string]: any;
}
