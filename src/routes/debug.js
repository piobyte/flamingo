/**
 * Flamingo debug route
 * @module flamingo/src/routes/debug
 */

var pkg = require('../../package.json'),
  RSVP = require('rsvp'),
  conf = require('../../config'),
  _ = require('lodash'),
  template = require('lodash/string/template'),
  fs = require('fs'),
  images = require('../../test/fixtures/images/sharp-bench-assets/index'),
  simpleHttpServer = require('../../targets/bench/simple-http-server'),
  path = require('path');

var DEBUG_PORT = 43723,
  DEBUG_HOST = 'localhost';

simpleHttpServer(DEBUG_HOST, DEBUG_PORT, function(req, res){
  res.writeHead(200, {'Content-Type': 'image/jpeg'});
  fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/sharp-bench-assets', req.url))
    .pipe(res, {end: true});
});

/*eslint no-sync:0 */
var URLS,
  HOST = 'http://' + DEBUG_HOST + ':' + DEBUG_PORT + '/',
  htmlTemplate = template(require('fs').readFileSync(__dirname + '/debug-template.html')),
  PLAIN_URLS = images.all().map(function (file) {
    return HOST + file.filename;
  });

RSVP.all(
  /*eslint new-cap: 0*/
  PLAIN_URLS.map(function (url) {
    return conf.ENCODE_PAYLOAD(url);
  })
).then(function (urls) {
  URLS = urls.map(function (url) {
    return encodeURIComponent(url);
  });
});

/**
 * Function to generate the debug route hapi configuration
 * @param {{conf: object, profiles: object}} flamingo configuration
 * @return {{method: string, path: string, handler: Function}} hapi route configuration
 * @see http://hapijs.com/api#serverrouteoptions
 * @see GET /debug
 */
module.exports = function (flamingo) {
  return {
    method: 'GET',
    path: '/debug',
    handler: function (req, reply) {
      var profileNames = Object.keys(flamingo.profiles),
        base = '/',
        processors = ['vips', 'gm'];

      profileNames = profileNames.filter(function (name) {
        // only use debug routes
        return name.indexOf('debug-') === 0;
      });

      if (req.query.profiles) {
        profileNames = req.query.profiles.split(',');
      }
      if (req.query.processors) {
        processors = req.query.processors.split(',');
      }

      reply(htmlTemplate({
        _: require('lodash'),
        pkg: pkg,
        profileNames: profileNames,
        urls: URLS,
        plainUrls: PLAIN_URLS,
        debugs: [],
        sizes: _.range(50, 250, 100),
        base: base,
        processors: processors,
        formats: [{}]
      }));
    }
  };
};
