/**
 * Error reply module
 * @module
 */
import boom = require('boom');
import errors = require('./errors');
import FlamingoOperation = require('../model/flamingo-operation');

const { InvalidInputError, ProcessingError } = errors;

/**
 * Function that calls the reply function with a given error by extracting useful error fields
 * and set the response status code accordingly.
 *
 * @param {FlamingoOperation} operation
 * @param {Error} error
 */
export = function(error: Error, operation: FlamingoOperation | any) {
  const isClientError =
    error instanceof InvalidInputError ||
    error instanceof ProcessingError ||
    typeof error === 'string';

  const message =
    operation.config && operation.config.DEBUG ? error.message : undefined;

  return isClientError
    ? boom.badRequest(message)
    : /* istanbul ignore next: can't produce an flamingo src error */ boom.internal(
        message
      );
};
