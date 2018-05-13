import nodeStream = require('stream');

/**
 * Object that represents a reader result.
 */
export interface ReaderResult {
  stream: () => Promise<nodeStream.Readable>;
  type: string;
  [field: string]: any;
}
