import nodeStream = require('stream');
import url = require('url');
import ReaderType = require('../model/reader-type');

interface BaseReaderResult {
  stream: () => Promise<nodeStream.Readable>;
  type: string;

  [field: string]: any;
}

interface RemoteReaderResult extends BaseReaderResult {
  type: ReaderType.REMOTE;
  url: url.Url;
}
interface FileReaderResult extends BaseReaderResult {
  type: ReaderType.FILE;
  path: string;
}

/**
 * Object that represents a reader result.
 */
export type ReaderResult = RemoteReaderResult | FileReaderResult;

// export function isRemote(readerResult: ReaderResult): readerResult is RemoteReaderResult {
//   return readerResult.type === ReaderType.REMOTE;
// }
// export function isFile(readerResult: ReaderResult): readerResult is FileReaderResult {
//   return readerResult.type === ReaderType.FILE;
// }
