var RSVP = require('rsvp'),
    sharp = require('sharp'),
    isArray = require('lodash/lang/isArray'),
    envParser = require('../util/env-parser'),
    bestFormat = require('../util/best-format'),
    clamp = require('clamp'),
    isPlainObject = require('lodash/lang/isPlainObject');

var avatarGenerator = function (dimension) {
        return function (request, config) {
            return new RSVP.Promise(function (resolve) {
                // override dimension with query.width
                var dim = clamp(envParser.objectInt('width', dimension)(request.query), 10, 1024),
                    format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

                if (!config.SUPPORTED.GM.WEBP) { format = {type: 'png', mime: 'image/png'}; }

                resolve({
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
            });
        };
    },
    previewGenerator = function (dimension) {
        return function (request, config) {
            return new RSVP.Promise(function (resolve) {
                // override dimension with query.width
                var dim = clamp(envParser.objectInt('width', dimension)(request.query), 10, 1024),
                    format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

                resolve({
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
            });
        };
    };

var profiles = {
    avatar: [
        ['image', 170, avatarGenerator]
    ],
    preview: [
        ['image', 200, previewGenerator]
    ]
};

/**
 * Recursive generation of profiles.
 * Useful for generating a profile name by hierarchical combining object property names:
 * android: [preview: [['mdpi', 64, fn]]] -> {android-preview-mdpi: fn}
 * @ignore
 * @param {String} prefix path  prefix
 * @param {Object} object Objects to traverse
 * @param {Object} all resulting object
 * @return {Object} Object containing key: profile name, value: profile generator function
 */
function buildProfiles(prefix, object, all) {
    Object.keys(object).forEach(function (key) {
        if (isArray(object[key])) {
            object[key].forEach(function (item) {
                all[(prefix.length ? prefix + '-' : '') + key + '-' + item[0]] = item[2](item[1]);
            });
        } else if (isPlainObject(object[key])) {
            all = buildProfiles(prefix + key, object[key], all);
        }
    });
    return all;
}

module.exports = buildProfiles('', profiles, {});
