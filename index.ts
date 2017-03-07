import Logger = require('./src/logger');
import Server = require('./src/model/server');
import Config = require('./config');
import AddonLoader = require('./src/addon/loader');
import IndexRoute = require('./src/routes/index');
import ImageRoute = require('./src/routes/image');
import VideoRoute = require('./src/routes/video');
import DebugRoute = require('./src/routes/debug');

const { build } = Logger;
const indexLogger = build('index');
const pkg = require('./package.json');

try {
  const memwatch = require('memwatch-next');
  const memLogger = build('memwatch');

  memwatch.on('leak', info => memLogger.info(info, 'leak'));
  memwatch.on('stats', info => memLogger.info(info, 'stats'));
} catch (error) {
  indexLogger.debug('starting without memwatch');
}

process.on('uncaughtException', err => indexLogger.error(err));

function buildRoutes(config: Config) {
  return [
    config.ROUTES.INDEX && new IndexRoute(config),
    config.ROUTES.PROFILE_CONVERT_IMAGE && new ImageRoute(config),
    config.ROUTES.PROFILE_CONVERT_VIDEO && new VideoRoute(config),
    config.DEBUG && new DebugRoute(config)
  ].filter(Boolean);
}

function buildProfiles(config: Config) {
  return [
    require('./src/profiles/examples'),
    config.DEBUG && require('./src/profiles/debug')
  ].filter(Boolean);
}

Config.fromEnv()
  .then(config =>
    new Server(config, new AddonLoader(__dirname, pkg).load())
      .withProfiles(buildProfiles(config))
      .withRoutes(buildRoutes(config))
      .start()
  )
  .then(server => indexLogger.info(`server running at ${server.hapi.info.uri}`))
  .catch(error => indexLogger.error(error));
