/**
 * Errors module
 * @module
 */

/**
 * Error that should be used if the input is invalid.
 * I.e. if profile name is unknown or input is not an image stream
 * @extends Error
 * @param {String} message
 * @constructor
 */
class InvalidInputError extends Error {
  constructor(props) {
    super(props);
    Error.captureStackTrace(this, InvalidInputError);
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
  constructor(props) {
    super(props);
    Error.captureStackTrace(this, ProcessingError);
  }
}

export = {
  InvalidInputError,
  ProcessingError
};
