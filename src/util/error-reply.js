/* @flow weak */
var boom = require('boom');

var codes = {
    ETIMEDOUT: boom.gatewayTimeout,
    ENETUNREACH: boom.gatewayTimeout,
    NotFound: boom.notFound,
    Forbidden: boom.forbidden
};

module.exports = function (reply/*: function */, error) {
    var code = error.code || error.statusCode,
        message = error.message || error.name;

    if (code && codes.hasOwnProperty(code)) {
        reply(codes[code](message));
    } else {
        reply({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'Internal Server Error'
        }).code(500);
    }
};
