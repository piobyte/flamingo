/* @flow weak */
/**
 * Error reply module
 * @module flamingo/src/util/error-reply
 */
var boom = require('boom'),
    http = require('http');

var codes = {
    ETIMEDOUT: boom.gatewayTimeout,
    ENETUNREACH: boom.gatewayTimeout,
    NotFound: boom.notFound,
    Forbidden: boom.forbidden
};

/**
 * Function that calls the reply function with a given error by extracting useful error fields
 * and set the response status code accordingly.
 *
 * @param {function} reply function to reply to request
 * @param {object} error error object
 * @returns {void}
 */
module.exports = function (reply/*: function */, error/*: {statusCode: ?string, name: ?string} */) {
    var code = error.code || error.statusCode,
        message = error.message || error.name;

    if (error instanceof http.IncomingMessage && error.hasOwnProperty('statusCode')) {
        reply(boom.create(error.statusCode));
    } else if (code && codes.hasOwnProperty(code)) {
        reply(codes[code](message));
    } else {
        reply(boom.internal());
    }
};
