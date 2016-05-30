/* @flow weak */
var Hapi = require('hapi-lts'),
  isArray = require('lodash/isArray'),
  merge = require('lodash/merge'),
  compact = require('lodash/compact'),
  RSVP = require('rsvp'),
  fs = require('fs'),
  path = require('path'),
  deprecate = require('./util/deprecate'),
  FlamingoOperation = require('./util/flamingo-operation'),
  addon = require('./addon');

var logger = require('./logger').build('server'),
  DEBUG_PROFILES_FILE = 'debug.js';

module.exports = function (conf, addons) {

  var server = new Hapi.Server({
      debug: conf.DEBUG ? /* istanbul ignore next */ {
        log: ['error'],
        request: ['error']
      } : false
    }),
    serverPlugins = [],
    profilesPath = path.join(__dirname, 'profiles'),
    flamingo = {conf: conf, profiles: {}, addons: addons};

  server.connection({
    port: conf.PORT
  });

  // pass server logging to custom logger
  server.on('log', /* istanbul ignore next */ function (ev, tags) {
    logger.info(isArray(tags) ? tags.join(' ') : tags, ev.data);
  });
  server.on('request-error', function (request, err) {
    logger.error({
      request: request,
      error: err
    }, 'Request error for ' + request.path);
  });

  // load existing profiles, filter debug profiles if DEBUG isn't truthy
  /*eslint no-sync: 0*/
  fs.readdirSync(profilesPath).filter(function (file) {
    return conf.DEBUG ? /* istanbul ignore next */ file : file !== DEBUG_PROFILES_FILE;
  }).forEach(function (file) {
    // $DisableFlow: flow wants string require :(
    merge(flamingo.profiles, require(path.join(profilesPath, file)));
  });

  addons.hook(addon.HOOKS.PROFILES)(flamingo.profiles);
  addons.hook(addon.HOOKS.ROUTES, flamingo)(server);
  addons.hook(addon.HOOKS.HAPI_PLUGINS, flamingo)(serverPlugins);

  logger.info('available profiles: ' + Object.keys(flamingo.profiles).join(', '));

  if (conf.ROUTES.PROFILE_CONVERT_IMAGE) {
    var imageRequestHandler = require('./routes/convert/image')(flamingo);

    // image convert route
    server.route({
      method: 'GET', path: '/convert/image/{profile}/{url}', config: {
        state: {parse: false},
        handler: function (req, reply) {
          return deprecate(function () {
            imageRequestHandler.config.handler(req, reply);
          }, '/convert/image/{profile}/{url} will be removed before in 2.0.0. Use /image/{profile}/{url} instead.', {id: 'convert-route-moved'});
        }
      }
    });

    server.route([imageRequestHandler]);
  }

  if (conf.ROUTES.PROFILE_CONVERT_VIDEO) {
    var videoRequestHandler = require('./routes/convert/video')(flamingo);

    // image convert route
    server.route({
      method: 'GET', path: '/convert/video/{profile}/{url}', config: {
        state: {parse: false},
        handler: function (req, reply) {
          return deprecate(function () {
            videoRequestHandler.config.handler(req, reply);
          }, '/convert/video/{profile}/{url} will be removed before in 2.0.0. Use /video/{profile}/{url} instead.', {id: 'convert-route-moved'});
        }
      }
    });

    server.route([videoRequestHandler]);
  }

  // static fields
  FlamingoOperation.prototype.config = conf;
  FlamingoOperation.prototype.addons = addons;
  FlamingoOperation.prototype.profiles = conf.profiles;

  // apply routes
  server.route(compact([
    conf.DEBUG && /* istanbul ignore next */ require('./routes/debug')(flamingo),
    conf.ROUTES.INDEX && require('./routes/index')(flamingo)
  ]));

  return RSVP.denodeify(server.register.bind(server))(serverPlugins.concat(require('./plugins/request-flamingo-operation'))).then(function () {
    return RSVP.denodeify(server.start.bind(server))().then(function () {
      return server;
    });
  });
};
