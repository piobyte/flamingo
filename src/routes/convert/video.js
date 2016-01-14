/* @flow */
/**
 * Flamingo video convert route
 * @module flamingo/src/routes/convert/video
 */
var url = require('url'),
  boom = require('boom'),
  RSVP = require('rsvp'),
  FlamingoOperation = require('../../util/flamingo-operation'),
  readerForUrl = require('../../util/reader-for-url'),
  errorReply = require('../../util/error-reply'),
  unfoldReaderResult = require('../../util/unfold-reader-result'),
  responseWriter = require('../../writer/response'),
  videoPreprocessor = require('../../preprocessor/video/index'),
  imageProcessor = require('../../processor/image');

var logger = require('../../logger').build('route:convert/video');

/**
 * Function to generate the image convert route hapi configuration
 * @param {{conf: object, profiles: object}} flamingo configuration
 * @return {{method: string, path: string, config: {cors: boolean, handler: Function}}} hapi route configuration
 * @see http://hapijs.com/api#serverrouteoptions
 * @see GET /convert/video/{profile}/{url}
 */
module.exports = function (flamingo/*: {conf: Config; profiles: {}} */)/*: {method: string; path: string; config: {handler: function} }*/ {
  var conf = flamingo.conf,
    profiles = flamingo.profiles;

  return {
    method: 'GET',
    path: '/video/{profile}/{url}',
    config: {
      state: { parse: false },
      cors: true,
      handler: function (req, reply) {
        var profileParam = req.params.profile,
          operation = new FlamingoOperation();

        operation.request = req;
        operation.reply = reply;
        operation.writer = responseWriter;

        if (!profiles[profileParam]) {
          return reply(boom.badRequest('Unknown profile'));
        }

        /*eslint new-cap: 0*/
        RSVP.hash({
          url: conf.DECODE_PAYLOAD(decodeURIComponent(req.params.url)),
          profile: profiles[profileParam](req, conf)
        }).then(function (data) {
          var parsedUrl = url.parse(data.url),
            reader = readerForUrl(parsedUrl);

          if (!reader) {
            return reply(boom.badRequest('No reader available for given url'));
          }

          operation.targetUrl = parsedUrl;
          operation.reader = reader;
          operation.profile = data.profile;
          operation.preprocessorConfig = {seekPercent: 0.1};

          // build processing queue
          return reader(operation)
            .then(videoPreprocessor(operation))
            .then(unfoldReaderResult)
            .then(imageProcessor(operation))
            .then(responseWriter(operation));
        }).catch(function (err) {
          logger.error({
            error: err,
            request: req
          }, 'Video convert error for ' + req.path);
          errorReply(reply, err);
        });
      }
    }
  };
};
