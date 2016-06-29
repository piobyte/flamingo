const logger = require('./src/logger');
const Server = require('./src/model/server');
const Config = require('./config');
const AddonLoader = require('./src/addon/loader');
const pkg = require('./package');

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
    new (require('./src/routes/index'))(config),
    new (require('./src/routes/image'))(config),
    new (require('./src/routes/video'))(config)
  ].concat(config.DEBUG ? [new (require('./src/routes/debug'))(config)] : []);
}

function buildProfiles(config) {
  return [
    require('./src/profiles/examples')
  ].concat(config.DEBUG ? [require('./src/profiles/debug')] : []);
}

Config.fromEnv().then(config =>
  new Server(config, new AddonLoader(__dirname, pkg).load())
    .withProfiles(buildProfiles(config))
    .withRoutes(buildRoutes(config))
    .start())
  .then(server => indexLogger.info(`server running at ${server.hapi.info.uri}`))
  .catch(error => indexLogger.error(error));
