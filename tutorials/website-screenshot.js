const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const Promise = require('bluebird');
const logger = require('../src/logger').build('tutorials/markdown-to-image');
const merge = require('lodash/merge');

const screenshot = require('screenshot-stream');

function WebsiteScreenshotPreprocess(SuperClass) {
  return class WebsiteScreenshotPreprocessor extends SuperClass {
    extractInput(operation) {
      return Promise.resolve(decodeURIComponent(operation.request.params.url));
    }

    extractReader(input) {
      return Promise.resolve((operation) => ({url: input}));
    }

    preprocess(operation) {
      return (readerResult) =>
        Promise.resolve(screenshot(readerResult.url, '1024x768', {delay: 1, crop: true}));
    }
  };
}

class WebsiteScreenshotRoute extends WebsiteScreenshotPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/www/{profile}/{url}', description = 'Profile website screenshot conversion') {
    super(conf, method, path, description);
  }
}

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig);
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new WebsiteScreenshotRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.hapi.info.uri}`) || server);
  });
