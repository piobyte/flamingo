/**
 * Errors module
 * @module
 */

/**
 * Error that should be used if the input is invalid.
 * I.e. if profile name is unknown or input is not an image stream
 * @extends Error
 * @param {String} message
 * @param {*} [extra]
 * @constructor
 */
class InvalidInputError extends Error {
  public extra?: any;

  constructor(message: string, extra?: any) {
    super(message);
    // Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    /* istanbul ignore else */
    if (extra) {
      this.extra = extra;
    }
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
class ProcessingError extends Error {
  public extra?: any;

  constructor(message: string, extra?: any) {
    super(message);
    // Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    /* istanbul ignore else */
    if (extra) {
      this.extra = extra;
    }
  }
}

const isInvalidInputError = (e: Error): e is InvalidInputError =>
  e instanceof InvalidInputError;
const isProcessingError = (e: Error): e is ProcessingError =>
  e instanceof ProcessingError;

export = {
  InvalidInputError,
  ProcessingError,

  isInvalidInputError,
  isProcessingError,
};
