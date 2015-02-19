var RSVP = require('rsvp'),
    fs = require('fs'),
    temp = require('temp'),
    stream = require('stream'),
    ffmpeg = require('fluent-ffmpeg'),
    cfg = require('../../config');

var logger = require('../logger')('preprocessor:video');

module.exports = function (options) {
    return function (readerResult) {
        return new RSVP.Promise(function (resolve, reject) {
            var cmd,
                tmpName = temp.path({suffix: '.png'}),
                killTimeoutId;

            if (readerResult.type === 'file') {
                // if its a local file we can improve performance by calling ffmpeg directly
                // without reading the content
                cmd = ffmpeg(readerResult.path);
            } else {
                cmd = ffmpeg(readerResult.stream());
            }
            // seek to time and save 1 frame
            cmd.seekInput(options.time)
                .frames(1)
                .format('image2')
                .on('start', function(commandLine) {
                    logger.info('Spawned ffmpeg with command: ' + commandLine);
                })
                .on('error', function (e) {
                    logger.warn('error', e);
                    reject(e);
                })
                .on('end', function () {
                    clearTimeout(killTimeoutId);
                    fs.exists(tmpName, function (exists) {
                        if (exists) {
                            resolve(fs.createReadStream(tmpName));
                        } else {
                            reject({
                                statusCode: 412,
                                error: 'Video preprocessor error.',
                                message: 'While converting video to image an error occurred. This can be caused by a bad input video or a time that is longer than the actual video.'
                            });
                        }
                    });
                })
                .save(tmpName);

            if (cfg.PREPROCESSOR.VIDEO.KILL_TIMEOUT >= 0) {
                killTimeoutId = setTimeout(function () {
                    cmd.kill();
                }, cfg.PREPROCESSOR.VIDEO.KILL_TIMEOUT);
            }
        });
    };
};
