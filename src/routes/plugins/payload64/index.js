var isPlainObject = require('lodash/lang/isPlainObject'),
    assign = require('lodash/object/assign'),
    conf = require('../../../../config'),
    boom = require('boom');

var logger = require('../../../logger')('payload64');

exports.register = function (server, options, next) {
    server.ext('onPreHandler', function (request, reply) {
        var plugins = request.route.settings.plugins;

        if (isPlainObject(plugins) && plugins.payload64) {
            var shouldDecode = plugins.payload64.decode,
                encoded = request.params.execution;

            if (shouldDecode) {
                /*eslint new-cap: 0, no-else-return: 0 */
                var decodedObj,
                    decode;

                try {
                    decode = conf.DECODE_PAYLOAD(decodeURIComponent(encoded));
                } catch(e) {
                    return reply(boom.badRequest('Error decoding the payload.'));
                }

                decode.then(function (utf8buf) {
                    try {
                        decodedObj = JSON.parse(utf8buf);
                    } catch (e) {
                        // param isn't valid json
                        return reply(boom.badRequest('Encoded execution payload is invalid JSON.'));
                    }
                    if (isPlainObject(decodedObj)) {
                        request.payload = assign({}, request.payload || {}, decodedObj);
                        return reply.continue();
                    } else {
                        // decoded isn't plain object
                        return reply(boom.badRequest('Encoded execution payload isn\'t a plain object.'));
                    }
                }).catch(function (err) {
                    logger.warn(err);
                    reply(boom.badRequest('Error decrypting payload', err));
                });
            }
        }
        return reply.continue();
    });

    return next();
};

exports.register.attributes = {
    name: 'payload64',
    version: '0.1.0'
};
