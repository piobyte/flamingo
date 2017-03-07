const Server = require('../src/model/server');
const Convert = require('../src/mixins/convert');
const Route = require('../src/model/route');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const merge = require('lodash/merge');
const logger = require('../src/logger').build('tutorials/image-meta');
const sharp = require('sharp');
const Promise = require('bluebird');
const {ProcessingError} = require('../src/util/errors');
const url = require('url');

class ImageMetaRoute extends Convert(Route) {
  constructor(conf, method = 'GET', path = '/image/{url}', description = 'Image metadata conversion') {
    super(conf, method, path, description);
  }

  extractInput(operation) {
    operation.input = url.parse(operation.request.params.url);
    return Promise.resolve(operation.input);
  }

  process() {
    return (stream) =>
      new Promise((resolve, reject) =>
        stream.pipe(sharp().metadata((err, data) => {
          /* istanbul ignore next */
          if (err) {
            reject(new ProcessingError(err));
          } else {
            resolve(data);
          }
        })));
  }

  write(operation){
    return (metadata) => operation.reply(metadata);
  }
}

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig);
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new ImageMetaRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.hapi.info.uri}`) || server);
  });
