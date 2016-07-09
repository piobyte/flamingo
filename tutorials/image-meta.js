const Server = require('../src/model/server');
const Route = require('../src/model/route');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const url = require('url');
const probe = require('probe-image-size');

class ImageMetaRoute extends Route {
  constructor(conf, method = 'GET', path = '/image/{url}', description = 'Image metadata conversion') {
    super(conf, method, path, description);
  }

  extractInput(operation) {
    return Promise.resolve(url.parse(operation.request.params.url));
  }

  handle(operation) {
    return this.extractInput(operation)
      .then(inputUrl => probe(url.format(inputUrl)))
      .then(result => operation.reply(result));
  }
}

Config.fromEnv().then(config => {
  return new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new ImageMetaRoute(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
