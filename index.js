const logger = require('./src/logger');
const Server = require('./src/model/server');
const Config = require('./config');
const AddonLoader = require('./src/addon/loader');
const pkg = require('./package.json');

const indexLogger = logger.build('index');

try {
  const memwatch = require('memwatch-next');
  const memLogger = logger.build('memwatch');

  memwatch.on('leak', (info) => memLogger.info(info, 'leak'));
  memwatch.on('stats', (info) => memLogger.info(info, 'stats'));
} catch (error) {
  indexLogger.debug('starting without memwatch');
}

process.on('uncaughtException', (err) => indexLogger.error(err));

function buildRoutes(config) {
  return [
    config.ROUTES.INDEX && new (require('./src/routes/index'))(config),
    config.ROUTES.PROFILE_CONVERT_IMAGE && new (require('./src/routes/image'))(config),
    config.ROUTES.PROFILE_CONVERT_VIDEO && new (require('./src/routes/video'))(config),
    config.DEBUG && new (require('./src/routes/debug'))(config)
  ].filter(Boolean);
}

function buildProfiles(config) {
  return [
    require('./src/profiles/examples'),
    config.DEBUG && require('./src/profiles/debug')
  ].filter(Boolean);
}

Config.fromEnv().then(config =>
  new Server(config, new AddonLoader(__dirname, pkg).load())
    .withProfiles(buildProfiles(config))
    .withRoutes(buildRoutes(config))
    .start())
  .then(server => indexLogger.info(`server running at ${server.hapi.info.uri}`))
  .catch(error => indexLogger.error(error));
