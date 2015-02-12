var boom = require('boom');

var codes = {
    ETIMEDOUT: boom.gatewayTimeout,
    ENETUNREACH: boom.gatewayTimeout,
    NotFound: boom.notFound
};

module.exports = function (reply, error) {
    if (error.code && codes.hasOwnProperty(error.code)) {
        reply(codes[error.code](error.message));
    } else {
        reply({
            statusCode: error.statusCode || 500,
            error: error.error || 'Internal Server Error',
            message: error.message
        }).code(error.statusCode || 500);
    }
};
