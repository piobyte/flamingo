var RSVP = require('rsvp'),
    sharp = require('sharp'),
    bestFormat = require('../util/best-format'),
    clamp = require('clamp'),
    config = require('../../config'),
    envParser = require('../util/env-parser');

var profiles = {
    'debug-rotate': function (request) {
        return new RSVP.Promise(function (resolve) {
            var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
                format = bestFormat(request.headers.accept, config.DEFAULT_MIME),
                process = [];

            if (request.query.processor === 'gm') {
                process.push({
                    processor: 'gm', pipe: function (pipe) {
                        if (format.type === 'webp') {
                            pipe = pipe.options({imageMagick: true});
                        }
                        return pipe
                            .rotate('transparent', 270)
                            .resize(dim, dim + '^')
                            .gravity('Center')
                            .extent(dim, dim)
                            .setFormat(format.type);
                    }
                });
            } else {
                process.push({
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe
                            .rotate(270)
                            .resize(dim, dim)
                            .toFormat(format.type);
                    }
                });
            }

            resolve({response: {header: {'Content-Type': format.mime}}, process: process});
        });
    },
    'debug-resize': function (request) {
        return new RSVP.Promise(function (resolve) {
            var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
                format = bestFormat(request.headers.accept, config.DEFAULT_MIME),
                process = [];

            if (request.query.processor === 'gm') {
                process.push({
                    processor: 'gm', pipe: function (pipe) {
                        if (format.type === 'webp') {
                            pipe = pipe.options({imageMagick: true});
                        }
                        return pipe.background('transparent').resize(dim, dim + '^').gravity('Center').extent(dim, dim).setFormat(format.type);
                    }
                });
            } else {
                process.push({
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe.resize(dim, dim)
                            .toFormat(format.type);
                    }
                });
            }

            // override dimension with query.width
            resolve({
                process: process
            });
        });
    },
    'debug-flip': function (request) {
        return new RSVP.Promise(function (resolve) {
            var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
                format = bestFormat(request.headers.accept, config.DEFAULT_MIME),
                process = [];

            if (request.query.processor === 'gm') {
                process.push({
                    processor: 'gm', pipe: function (pipe) {
                        if (format.type === 'webp') {
                            pipe = pipe.options({imageMagick: true});
                        }
                        return pipe.flip().background('transparent').resize(dim, dim + '^').gravity('Center').extent(dim, dim).setFormat(format.type);
                    }
                });
            } else {
                process.push({
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe.flip().resize(dim, dim)
                            .toFormat(format.type);
                    }
                });
            }

            resolve({
                process: process
            });
        });
    },
    'debug-preview-image': function (request) {
        return new RSVP.Promise(function (resolve) {
            var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
                format = bestFormat(request.headers.accept, config.DEFAULT_MIME),
                process = [];

            if (request.query.processor === 'gm') {
                process.push({
                    processor: 'gm', pipe: function (pipe) {
                        if (format.type === 'webp') {
                            pipe = pipe.options({imageMagick: true});
                        }
                        return pipe.autoOrient()
                            .background('white')
                            .setFormat(format.type)
                            .resize(dim, dim + '^')
                            .gravity('Center')
                            .extent(dim, dim);
                    }
                });
            } else {
                process.push({
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe
                            .rotate()
                            .background('white')
                            .flatten()
                            .toFormat(format.type)
                            .resize(dim, dim)
                            .min()
                            .crop(sharp.gravity.center);
                    }
                });
            }

            resolve({
                process: process
            });
        });
    },
    'debug-avatar-image': function (request) {
        return new RSVP.Promise(function (resolve) {
            var dim = clamp(envParser.objectInt('width', 200)(request.query), 10, 1024),
                format = bestFormat(request.headers.accept, config.DEFAULT_MIME),
                process = [];

            if (request.query.processor === 'gm') {
                process.push({
                    processor: 'gm', pipe: function (pipe) {
                        if (format.type === 'webp') {
                            pipe = pipe.options({imageMagick: true});
                        }
                        return pipe
                            .autoOrient()
                            .setFormat(format.type)
                            .resize(dim, dim + '^')
                            .gravity('Center')
                            .extent(dim, dim);
                    }
                });
            } else {
                process.push({
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe
                            .rotate()
                            .toFormat(format.type)
                            .resize(dim, dim)
                            .min()
                            .crop(sharp.gravity.center);
                    }
                });
            }

            resolve({
                process: process
            });
        });
    }
};

module.exports = profiles;
