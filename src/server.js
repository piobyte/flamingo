var Hapi = require('hapi'),
  isArray = require('lodash/lang/isArray'),
  merge = require('lodash/object/merge'),
  compact = require('lodash/array/compact'),
  RSVP = require('rsvp'),
  fs = require('fs'),
  path = require('path'),
  addon = require('./addon');

var logger = require('./logger').build('server'),
  DEBUG_PROFILES_FILE = 'debug.js';

module.exports = function (serverConfig, addons) {
  var server = new Hapi.Server({debug: serverConfig.DEBUG ? {log: ['error'], request: ['error']} : false}),
    serverPlugins = [],
    profilesPath = path.join(__dirname, 'profiles'),
    flamingo = {conf: serverConfig, profiles: {}, addons: addons};

  server.connection({
    port: serverConfig.PORT
  });

  // pass server logging to custom logger
  server.on('log', function (ev, tags) {
    logger.info(isArray(tags) ? tags.join(' ') : tags, ev.data);
  });
  server.on('request-error', function (request, err) {
    logger.error({
      request: request,
      error: err
    }, 'Request error for ' + request.path);
  });

  /*eslint no-sync: 0*/
  fs.readdirSync(profilesPath).filter(function (file) {
    return serverConfig.DEBUG ? file : file !== DEBUG_PROFILES_FILE;
  }).forEach(function (file) {
    merge(flamingo.profiles, require(path.join(profilesPath, file)));
  });

  addons.hook(addon.HOOKS.PROFILES)(flamingo.profiles);
  addons.hook(addon.HOOKS.ROUTES, flamingo)(server);
  addons.hook(addon.HOOKS.HAPI_PLUGINS, flamingo)(serverPlugins);

  logger.info('available profiles: ' + Object.keys(flamingo.profiles).join(', '));

  // apply routes
  server.route(compact([
    serverConfig.DEBUG && require('./routes/debug')(flamingo),
    serverConfig.ROUTES.INDEX && require('./routes/index')(flamingo),
    serverConfig.ROUTES.PROFILE_CONVERT_IMAGE && require('./routes/convert/image')(flamingo),
    serverConfig.ROUTES.PROFILE_CONVERT_VIDEO && require('./routes/convert/video')(flamingo)
  ]));

  return RSVP.denodeify(server.register.bind(server))(serverPlugins).then(function () {
    return RSVP.denodeify(server.start.bind(server))();
  });
};
