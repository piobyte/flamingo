/* @flow weak */

const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const merge = require('lodash/merge');
const logger = require('../src/logger').build('tutorials/custom-urls');

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig, {CRYPTO: {ENABLED: false}});
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new Image(config, 'GET', '/convert/image/{profile}/{url}')])
      .start()
      .then(server => logger.info(`server running at ${server.hapi.info.uri}`) || server);
  });
