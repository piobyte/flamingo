/* @flow */
/**
 * Error reply module
 * @module flamingo/src/util/error-reply
 */
const boom = require('boom');
const errors = require('../util/errors');

/**
 * Function that calls the reply function with a given error by extracting useful error fields
 * and set the response status code accordingly.
 *
 * TODO: jsdoc
 */
module.exports = function (operation/*: function */, error/*: Error */) {
  var isClientError =
    error instanceof errors.InvalidInputError ||
    error instanceof errors.ProcessingError ||
    typeof error === 'string';

  const message = operation.config.DEBUG ? error.message : undefined;

  operation.reply(isClientError ? boom.badRequest(message) : /* istanbul ignore next: can't produce an flamingo src error */ boom.internal(message));
};
