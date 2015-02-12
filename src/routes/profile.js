var url = require('url'),
    boom = require('boom'),
    fs = require('fs'),
    path = require('path'),
    conf = require('../../config'),
    profileLoader = require('../util/profile-loader'),
    errorReply = require('../util/error-reply'),
    unfoldReaderResult = require('../util/unfold-reader-result');

var logger = require('../logger')();

var writers = {
        file: require('../writer/file'),
        response: require('../writer/response')
    },
    /*eslint no-sync: 0 */
    // sync allowed because it is run while loading the module
    PROFILES = profileLoader.loadAll(conf.PROFILES_DIR),
    readers = {
        file: require('../reader/file'),
        data: require('../reader/data'),
        http: require('../reader/https'),
        https: require('../reader/https')
    },
    processors = {
        image: require('../processor/image')
    };

module.exports = {
    method: 'GET',
    path: '/convert/{profile}/{url}',
    config: {
        cors: true,
        handler: function (req, reply) {
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
                    profileLoader.build(PROFILES[profile], req.query).then(function (loadedProfile) {
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
                                        errorReply(reply, err);
                                    });
                            } else {
                                reply(boom.preconditionFailed(
                                    'Has input reader: ' + !!reader + ', ' +
                                    'output writer: ' + !!writer + ', ' +
                                    'processor: ' + !!processor));
                            }
                        } else {
                            reply(boom.badRequest('Input url malformed.'));
                        }
                    });
                } else {
                    // no known profile
                    reply(boom.badRequest('No input or output protocol found'));
                }
            }).catch(function (err) {
                logger.warn(err);
                reply(boom.badRequest('Error decrypting payload', err));
            });
        }
    }
};
