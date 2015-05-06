var ffmpeg = require('fluent-ffmpeg'),
    RSVP = require('rsvp'),
    assert = require('assert'),
    cfg = require('../../../config');

var logger = require('../../logger')('preprocessor:video');

module.exports = function (options) {
    return function (readerResult) {
        var ffmpegOptions = {};

        if (cfg.PREPROCESSOR.VIDEO.KILL_TIMEOUT) {
            ffmpegOptions.timeout = cfg.PREPROCESSOR.VIDEO.KILL_TIMEOUT;
        }

        function videoProcessor(input) {
            return new RSVP.Promise(function (resolve, reject) {
                ffmpeg.ffprobe(input, function (err, meta) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        assert.ok(meta.hasOwnProperty('format') && meta.format.hasOwnProperty('duration'), 'ffprobe can detect input duration.');

                        // seek to time and save 1 frame
                        resolve(ffmpeg(input, ffmpegOptions)
                            .noAudio()
                            .seekInput(meta.format.duration * options.seekPercent)
                            .frames(1)
                            .format('image2')
                            //.addOptions(['-movflags frag_keyframe+faststart'])
                            .on('codecData', function (data) {
                                logger.debug(data);
                            })
                            .on('start', function (commandLine) {
                                logger.debug('Spawned ffmpeg with command: ' + commandLine);
                            })
                            .on('error', function (e) {
                                logger.warn('error', e);
                            })
                            .on('end', function () {
                                logger.debug('ffmpeg end');
                            }));
                    }
                });
            });
        }

        switch (readerResult.type) {
            case 'file':
                return videoProcessor(readerResult.path);
            case 'remote':
                return videoProcessor(readerResult.url.href);
            default:
                return readerResult.stream().then(function (stream) {
                    return videoProcessor(stream);
                });
        }
    };
};
