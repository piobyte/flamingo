module.exports = {
    type: 'object',
    required: ['id', 'degrees'],
    properties: {
        id: {
            type: 'string',
            'enum': ['flip']
        },
        flip: {
            type: 'integer',
            // dont accept 0 rotation
            minimum: 0
        }
    }
};
