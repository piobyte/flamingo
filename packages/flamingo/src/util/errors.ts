/**
 * Errors module
 * @module
 */

import util = require("util");

/**
 * Error that should be used if the input is invalid.
 * I.e. if profile name is unknown or input is not an image stream
 * @extends Error
 * @param {String} message
 * @param {*} [extra]
 * @constructor
 */
function InvalidInputError(message, extra?) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  /* istanbul ignore else */
  if (extra) {
    this.extra = extra;
  }
}

/**
 * Error that should be used if a processing operation fails.
 * I.e. during video to image conversion
 * @extends Error
 * @param {String} message
 * @param {*} [extra]
 * @constructor
 */
function ProcessingError(message, extra?) {
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

export = {
  InvalidInputError,
  ProcessingError
};
