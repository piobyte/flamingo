module.exports = {
    //$schema: 'http://json-schema.org/draft-04/schema#',
    title: 'Processor for images',
    type: 'object',
    required: ['type', 'queue'],
    properties: {
        type: {
            type: 'string',
            'enum': ['image']
        },
        queue: {
            type: 'array',
            minItems: 1,
            items: {
                anyOf: [
                    { $ref: '#/definitions/scaleTransform'},
                    { $ref: '#/definitions/rotateTransform'},
                    { $ref: '#/definitions/flipTransform'},
                    { $ref: '#/definitions/cropTransform'}
                ],
                type: 'object',
                properties: {
                    id: {
                        type: 'string'
                    },
                    process: {
                        type: 'array'
                    }
                }
            }
        }
    }
};
