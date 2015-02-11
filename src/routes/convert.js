var convertSchema = require('../schema/convert'),
    url = require('url'),
    conf = require('../../config'),
    boom = require('boom'),
    unfoldReaderResult = require('../util/unfold-reader-result');

var logger = require('../logger')();

var writers = {
        file: require('../writer/file'),
        response: require('../writer/response')
    },
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
    };

module.exports = {
    method: 'GET',
    path: '/convert/{execution}',
    config: {
        cors: true,
        plugins: {
            payload64: {
                decode: true
            },
            ratify: {
                payload: convertSchema
            }
        },
        handler: function (req, reply) {
            var options = req.payload,
                input = url.parse(options.input),
                preprocessor = options.preprocessor ? preprocessors[options.preprocessor.type] : false,
                output = url.parse(options.output);

            if (input.protocol === null || output.protocol === null) {
                reply(boom.badRequest('No input or output protocol found'));
            } else {
                var reader = readers[input.protocol.substring(0, input.protocol.length - 1)],
                    writer = writers[output.protocol.substring(0, output.protocol.length - 1)],
                    processor = processors[options.processor.type];

                if (reader && processor && writer) {
                    // build processing queue
                    var processQ = reader(input, conf.ACCESS.READ);
                    if (preprocessor) {
                        // apply preprocessor if existing
                        processQ = processQ.then(preprocessor(options.preprocessor.options));
                    } else {
                        processQ = processQ.then(unfoldReaderResult);
                    }
                    processQ
                        .then(processor(options.processor.queue))
                        .then(writer(output, reply))
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
        }
    }
};
