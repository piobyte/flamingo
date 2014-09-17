module.exports = {
    type: 'object',
    required: ['id', 'width', 'height'],
    properties: {
        id: {
            type: 'string',
            'enum': ['scale']
        },
        width: {
            type: 'integer',
            minimum: 1
        },
        height: {
            type: 'integer',
            minimum: 1
        }
    }
};
