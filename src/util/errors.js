/**
 * Errors module
 * @module
 */

const util = require('util');

/**
 * @extends Error
 * @param {String} message
 * @param {*} [extra]
 * @constructor
 */
function InvalidInputError(message, extra) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  /* istanbul ignore else */
  if (extra) {
    this.extra = extra;
  }
}

/**
 * @extends Error
 * @param {String} message
 * @param {*} [extra]
 * @constructor
 */
function ProcessingError(message, extra) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  /* istanbul ignore else */
  if (extra) {
    this.extra = extra;
  }
}

util.inherits(InvalidInputError, Error);
util.inherits(ProcessingError, Error);

module.exports = {
  InvalidInputError,
  ProcessingError
};
