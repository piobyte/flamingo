/* @flow */
/**
 * Error reply module
 * @module flamingo/src/util/error-reply
 */
var boom = require('boom'),
  errors = require('../util/errors');

/**
 * Function that calls the reply function with a given error by extracting useful error fields
 * and set the response status code accordingly.
 *
 * @param {function} reply function to reply to request
 * @param {object} error error object
 * @returns {void}
 */
module.exports = function (reply/*: function */, error/*: {statusCode: ?string, name: ?string} */) {
  var isClientError =
    error instanceof errors.InvalidInputError ||
    error instanceof errors.ProcessingError ||
    typeof error === 'string';

  reply(isClientError ? boom.badRequest() : /* istanbul ignore next: can't produce an flamingo src error */ boom.internal());
};
