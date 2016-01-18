/* @flow */
/**
 * Flamingo image convert route
 * @module flamingo/src/routes/convert/image
 */
var url = require('url'),
  boom = require('boom'),
  RSVP = require('rsvp'),
  readerForUrl = require('../../util/reader-for-url'),
  errorReply = require('../../util/error-reply'),
  unfoldReaderResult = require('../../util/unfold-reader-result'),
  responseWriter = require('../../writer/response'),
  FlamingoOperation = require('../../util/flamingo-operation'),
  imageProcessor = require('../../processor/image');

var logger = require('../../logger').build('route:convert/image');

/**
 * Function to generate the image convert route hapi configuration
 * @param {{conf: object, profiles: object}} flamingo configuration
 * @return {{method: string, path: string, config: {cors: boolean, handler: Function}}} hapi route configuration
 * @see http://hapijs.com/api#serverrouteoptions
 * @see GET /convert/image/{profile}/{url}
 */
module.exports = function (flamingo/*: {conf: Config; profiles: {}} */)/*: {method: string; path: string; config: {handler: function} }*/ {
  var conf = flamingo.conf,
    profiles = flamingo.profiles;

  return {
    method: 'GET',
    path: '/image/{profile}/{url}',
    config: {
      state: { parse: false },
      cors: true,
      handler: function (request, reply) {
        var profileParam = request.params.profile,
          operation = new FlamingoOperation();

        operation.reply = reply;
        operation.writer = responseWriter;

        if (!profiles[profileParam]) {
          return reply(boom.badRequest('Unknown profile'));
        }

        /*eslint new-cap: 0*/
        RSVP.hash({
          url: conf.DECODE_PAYLOAD(decodeURIComponent(request.params.url)),
          profile: profiles[profileParam](request, conf)
        }).then(function (data) {
          var parsedUrl = url.parse(data.url),
            reader = readerForUrl(parsedUrl);

          if (!reader) {
            return reply(boom.badRequest('No reader available for given url'));
          }

          operation.targetUrl = parsedUrl;
          operation.reader = reader;
          operation.profile = data.profile;

          // build processing queue
          return reader(operation)
            .then(unfoldReaderResult)
            .then(imageProcessor(operation))
            .then(responseWriter(operation));
        }).catch(function (err) {
          logger.error({
            error: err,
            request: request
          }, 'Image convert error for ' + request.path);
          errorReply(reply, err);
        });
      }
    }
  };
};
