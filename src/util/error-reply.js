/* @flow */
/**
 * Error reply module
 * @module flamingo/src/util/error-reply
 */
const boom = require('boom');
const {InvalidInputError, ProcessingError} = require('../util/errors');

/**
 * Function that calls the reply function with a given error by extracting useful error fields
 * and set the response status code accordingly.
 *
 * @param {FlamingoOperation} operation
 * @param {Error} error
 */
module.exports = function (operation/*: function */, error/*: Error */) {
  const isClientError =
    error instanceof InvalidInputError ||
    error instanceof ProcessingError ||
    typeof error === 'string';

  const message = operation.config.DEBUG ? error.message : undefined;

  operation.reply(isClientError ? boom.badRequest(message) : /* istanbul ignore next: can't produce an flamingo src error */ boom.internal(message));
};
