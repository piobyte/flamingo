var util = require('util');

var InvalidInputError = function InvalidInputError(message, extra) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    /* istanbul ignore else */
    if (extra) {
      this.extra = extra;
    }
  },
  ProcessingError = function ProcessingError(message, extra) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    /* istanbul ignore else */
    if (extra) {
      this.extra = extra;
    }
  };

util.inherits(InvalidInputError, Error);
util.inherits(ProcessingError, Error);

module.exports = {
  InvalidInputError: InvalidInputError,
  ProcessingError: ProcessingError
};
