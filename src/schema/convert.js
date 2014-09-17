module.exports = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    title: 'Convert something',
    type: 'object',
    required: ['input', 'processor', 'output'],
    additionalProperties: true,
    properties: {
        output: {
            type: 'string',
            title: 'Output URI'
        },
        input: {
            type: 'string',
            title: 'Input URI'
        },
        preprocessor: {
            type: 'object',
            title: 'input preprocessor',
            oneOf: [
                { $ref: '#/definitions/preprocessorVideo' }
            ]
        },
        processor: {
            oneOf: [
                { $ref: '#/definitions/imageProcessor' }
            ]
        }
    },
    definitions: {
        preprocessorVideo: require('./preprocessor-video'),
        imageProcessor: require('./image-processor'),
        scaleTransform: require('./scale-transform'),
        rotateTransform: require('./rotate-transform'),
        flipTransform: require('./flip-transform'),
        cropTransform: require('./crop-transform')
    }
};
