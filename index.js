const boot = require('./src/boot');
const logger = require('./src/logger');

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

boot()
  .then(server => indexLogger.info(`server running at ${server.hapi.info.uri}`))
  .catch(error => indexLogger.error(error));
