var convertSchema = require('../schema/convert'),
    url = require('url'),
    _ = require('lodash-node'),
    boom = require('boom'),
    fs = require('fs'),
    path = require('path'),
    limiter = require('limiter'),
    conf = require('../../config'),
    profileLoader = require('../util/profile-loader'),
    unfoldReaderResult = require('../util/unfold-reader-result');

var logger = require('../logger')();

var rateLimiter = new limiter.RateLimiter(
        conf.RATE_LIMIT.ALL.REQUESTS,
        conf.RATE_LIMIT.ALL.TIME,
        !conf.RATE_LIMIT.ALL.WAIT_FOR_TOKEN),
    writers = {
        file: require('../writer/file'),
        response: require('../writer/response')
    },
    /*eslint no-sync: 0 */
    // sync allowed because it is run while loading the module
    PROFILES = profileLoader.loadAll(conf.PROFILES.FILE, conf.PROFILES.DIR),
    readers = {
        file: require('../reader/file'),
        data: require('../reader/data'),
        http: require('../reader/https'),
        https: require('../reader/https')
    },
    preprocessors = {
        video: require('../preprocessor/video')
    },
    processors = {
        image: require('../processor/image')
    },
    convertRequestHandler = function (req, reply) {
        var profile = req.params.profile,
            decode;

        try {
            /*eslint new-cap: 0 */
            decode = conf.DECODE_PAYLOAD(decodeURIComponent(req.params.url));
        } catch (e) {
            // url decode errored
            return reply(boom.badRequest('No input or output protocol found'));
        }

        decode.then(function (inputUrl) {
            if (PROFILES.hasOwnProperty(profile)){
                // has profile
                profileLoader.build(PROFILES[profile]).then(function (loadedProfile) {
                    var queue = loadedProfile.process,
                        response = loadedProfile.response,
                        input = url.parse(inputUrl);

                    if (input.protocol !== null) {
                        var reader = readers[input.protocol.substring(0, input.protocol.length - 1)],
                            writer = writers.response,
                            processor = processors.image;

                        if (reader && processor && writer) {
                            // build processing queue
                            reader(input, conf.ACCESS.READ)
                                .then(unfoldReaderResult)
                                .then(processor(queue))
                                .then(writer(null, reply, response))
                                .catch(function (err) {
                                    logger.warn(err);
                                    reply({
                                        statusCode: err.statusCode || 500,
                                        error: err.error || 'Internal Server Error',
                                        message: err.message
                                    }).code(err.statusCode || 500);
                                });
                        } else {
                            reply(boom.preconditionFailed(
                                'Has input reader: ' + !!reader + ', ' +
                                'output writer: ' + !!writer + ', ' +
                                'processor: ' + !!processor));
                        }
                    }
                });
            } else {
                // no known profile
                reply(boom.badRequest('No input or output protocol found'));
            }
        }).catch(function (err) {
            console.log('ERR', err);
            reply(boom.badRequest('Error decrypting payload', err));
        });
    };

module.exports = {
    method: 'GET',
    path: '/convert/{profile}/{url}',
    config: {
        cors: true,
        handler: function (req, reply) {
            rateLimiter.removeTokens(1, function(err, remainingRequests) {
                if (err) {
                    reply(err);
                }else {
                    if (remainingRequests < 0) {
                        reply(boom.tooManyRequests('You\'ve send too many requests. Please wait and try again later.'));
                    } else {
                        convertRequestHandler(req, reply);
                    }
                }
            });
        }
    }
};
