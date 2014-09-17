module.exports = {
    title: 'Preprocessor for videos',
    type: 'object',
    required: ['type', 'options'],
    properties: {
        type: {
            type: 'string',
            'enum': ['video']
        },
        options: {
            type: 'object',
            anyOf: [
                {
                    title: 'video preprocessor options',
                    type: 'object',
                    properties: {
                        time: {
                            type: 'integer',
                            title: 'Video seek time',
                            description: 'Video seek in seconds after which the screenshot is taken',
                            minimum: 0
                        }
                    }
                }
            ]
        }
    }
};
