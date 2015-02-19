var url = require('url'),
    boom = require('boom'),
    fs = require('fs'),
    path = require('path'),
    conf = require('../../config'),
    profileLoader = require('../util/profile-loader'),
    errorReply = require('../util/error-reply'),
    unfoldReaderResult = require('../util/unfold-reader-result');

const KEY_DELIMITER = '-';

var logger = require('../logger')('route:s3'),
    writers = { response: require('../writer/response') },
    /*eslint no-sync: 0 */
    // sync allowed because it is run while loading the module
    PROFILES = profileLoader.loadAll(conf.PROFILES_DIR),
    readers = { s3: require('../reader/s3') },
    processors = {
        image: require('../processor/image')
    };

module.exports = {
    method: 'GET',
    path: '/s3/{bucketAlias}/{profile}/{key}',
    config: {
        cors: true,
        handler: function (req, reply) {
            var bucketAlias = req.params.bucketAlias,
                profile = req.params.profile,
                keyString = req.params.key;

            // extract bucket from key
            var keySplit = keyString.split(KEY_DELIMITER);
            if (!conf.AWS.S3.BUCKETS.hasOwnProperty(bucketAlias)) {
                reply(boom.badRequest('Unknown bucket alias'));
            } else if (keySplit.length < 2) {
                reply(boom.badRequest('Invalid key string format'));
            } else {
                var key = keySplit.slice(-2).join('/'),
                    bucket = conf.AWS.S3.BUCKETS[bucketAlias];

                if (PROFILES.hasOwnProperty(profile)){
                    // has profile
                    profileLoader.build(PROFILES[profile], req.query).then(function (loadedProfile) {
                        var queue = loadedProfile.process,
                            response = loadedProfile.response;

                        var reader = readers.s3,
                            writer = writers.response,
                            processor = processors.image;

                        try {
                            // build processing queue
                            reader(bucket, key)
                                .then(unfoldReaderResult)
                                .then(processor(queue))
                                .then(writer(null, reply, response))
                                .catch(function (err) {
                                    logger.warn(err);
                                    errorReply(reply, err);
                                });
                        } catch(err) {
                            logger.warn(err);
                            errorReply(reply, err);
                        }
                    });
                } else {
                    // no known profile
                    reply(boom.badRequest('Profile not available.'));
                }
            }
        }
    }
};
