/* @flow weak */
var ffmpeg = require('fluent-ffmpeg'),
  RSVP = require('rsvp'),
  assign = require('lodash/object/assign'),
  isFinite = require('lodash/lang/isFinite'),
  request = require('request'),
  errors = require('../../util/errors'),
  pkg = require('../../../package'),
  deprecate = require('../../util/deprecate'),
  noop = require('lodash/utility/noop'),
  globalConfig = require('../../../config');

function _isPreprocessorConfig(config) {
  return config.hasOwnProperty('seekPercent');
}

var logger = require('../../logger').build('preprocessor:video'),
  defaultProcessConf = {
    seekPercent: 0
  };

module.exports = function (operation) {
  var conf,
    givenProcessConf;

  if (arguments.length === 2) {
    deprecate(noop, 'Video preprocessor called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    givenProcessConf = arguments[0];
    conf = arguments[1];
  } else if(_isPreprocessorConfig(operation)) {
    deprecate(noop, 'Video preprocessor called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    conf = globalConfig;
    givenProcessConf = arguments[0];
  } else {
    conf = operation.config;
    givenProcessConf = operation.preprocessorConfig;
  }
  //
  var processConf = assign({}, defaultProcessConf, givenProcessConf);

  return function (readerResult) {
    var ffmpegOptions = {};

    /* istanbul ignore else */
    if (conf.PREPROCESSOR.VIDEO.KILL_TIMEOUT) {
      ffmpegOptions.timeout = conf.PREPROCESSOR.VIDEO.KILL_TIMEOUT;
    }

    function videoProcessor(input) {
      return new RSVP.Promise(function (resolve, reject) {
        ffmpeg.ffprobe(input, function (err, meta) {
          if (err) {
            reject(new errors.InvalidInputError(err.message, err));
          }
          else {
            /* istanbul ignore next */
            if (!meta.hasOwnProperty('format')) {
              throw new errors.InvalidInputError('Input format is undetectable by ffprobe');
            }

            var duration = isFinite(meta.format.duration) ? meta.format.duration : 0;

            // seek to time and save 1 frame
            resolve(ffmpeg(input, ffmpegOptions)
              .noAudio()
              .seekInput(duration * processConf.seekPercent)
              .frames(1)
              .format('image2')
              .on('codecData', function (data) {
                logger.debug(data);
              })
              .on('start', function (commandLine) {
                logger.info('Spawned ffmpeg with command: ' + commandLine);
              })
              .on('error', function (e) {
                throw new errors.ProcessingError(e.message, e);
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
      var promise;
      if (conf.ALLOW_READ_REDIRECT) {
        promise = videoProcessor(readerResult.url.href);
      } else {
        // do HEAD to check if redirect response code because ffprobe/ffmpeg always follow redirects
        promise = new RSVP.Promise(function (res, rej) {
          request.head(readerResult.url.href, {
            timeout: conf.READER.REQUEST.TIMEOUT,
            headers: {'User-Agent': pkg.name + '/' + pkg.version + ' (+' + pkg.bugs.url + ')'},
            followRedirect: false,
            maxRedirects: 0
          }, function (err) {
            if (err) {
              rej(new errors.InvalidInputError('Error while doing a HEAD request to check for redirects', err));
            } else {
              res(videoProcessor(readerResult.url.href));
            }
          });
        });
      }
      return promise;
    default:
      return readerResult.stream().then(function (stream) {
        return videoProcessor(stream);
      });
    }
  };
};
