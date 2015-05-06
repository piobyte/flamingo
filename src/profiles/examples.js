var RSVP = require('rsvp'),
    sharp = require('sharp'),
    envParser = require('../util/env-parser'),
    bestFormat = require('../util/best-format'),
    clamp = require('clamp');

module.exports = {
    'avatar-image': function (request, config) {
        // override dimension with query.width
        var dim = clamp(envParser.objectInt('width', 170)(request.query), 10, 1024),
            format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

        if (!config.SUPPORTED.GM.WEBP) { format = {type: 'png', mime: 'image/png'}; }

        return RSVP.resolve({
            response: { header: { 'Content-Type': format.mime }},
            process: [
                { processor: 'gm', pipe: function (pipe) {
                    if (format.type === 'webp') {
                        pipe = pipe.options({imageMagick: true});
                    }
                    return pipe
                        .autoOrient()
                        .setFormat(format.type)
                        .resize(dim, dim + '^')
                        .gravity('Center')
                        .extent(dim, dim);
                }}
            ]
        });
    },

    'preview-image': function (request, config) {
        // override dimension with query.width
        var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
            format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

        return RSVP.resolve({
            response: { header: { 'Content-Type': format.mime }},
            process: [
                { processor: 'sharp', pipe: function (instance) {
                    return instance
                        .rotate()
                        .background('white').flatten()
                        .toFormat(format.type)
                        .resize(dim, dim)
                        .min()
                        .crop(sharp.gravity.center);
                }}
            ]
        });
    }
};
