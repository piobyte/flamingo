module.exports = {
    type: 'object',
    required: ['id', 'degrees'],
    properties: {
        id: {
            type: 'string',
            'enum': ['rotate']
        },
        degrees: {
            type: 'integer',
            // dont accept 0 rotation
            minimum: 1,
            // dont accept 360 => 0 rotation
            maximum: 359
        }
    }
};
