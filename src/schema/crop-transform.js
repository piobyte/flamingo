module.exports = {
    type: 'object',
    required: ['id', 'x', 'y', 'width', 'height'],
    properties: {
        id: {
            type: 'string',
            'enum': ['crop']
        },
        width: {
            type: 'integer',
            minimum: 1
        },
        height: {
            type: 'integer',
            minimum: 1
        },
        x: {
            type: 'integer',
            minimum: 0
        },
        y: {
            type: 'integer',
            minimum: 0
        }
    }
};
