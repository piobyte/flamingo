/**
 * ReaderType module
 * @module
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
  REMOTE: 'remote'
};

module.exports = ReaderType;
