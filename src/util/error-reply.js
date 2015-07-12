/* @flow weak */
var boom = require('boom'),
    http = require('http');

var codes = {
    ETIMEDOUT: boom.gatewayTimeout,
    ENETUNREACH: boom.gatewayTimeout,
    NotFound: boom.notFound,
    Forbidden: boom.forbidden
};

module.exports = function (reply/*: function */, error) {
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
