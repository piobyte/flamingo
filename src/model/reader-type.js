/**
 * ReaderType module
 * @module flamingo/src/model/reader-type
 */

/**
 * Reader type enum
 * @readonly
 * @enum {string}
 */
const ReaderType = {
  /** Input that is a local file */
  FILE: 'file',
  /** Input that is in a remote location, i.e. another server */
  REMOTE: 'remote',
  /** Input that is encoded as a base64 data uri*/
  DATA: 'data'
};

module.exports = ReaderType;
