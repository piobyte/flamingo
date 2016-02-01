'use strict';

const Server = require('./model/server');
const Config = require('../config');
const AddonLoader = require('./addon/loader');
const pkg = require('../package');

function buildRoutes(config) {
  return [
    new (require('./routes/index'))(config),
    new (require('./routes/image'))(config),
    new (require('./routes/video'))(config)
  ].concat(config.DEBUG ? [new (require('./routes/debug'))(config)] : []);
}

function buildProfiles(config) {
  return [
    require('./profiles/examples')
  ].concat(config.DEBUG ? [require('./profiles/debug')] : []);
}

exports.profiles = buildProfiles;
exports.routes = buildRoutes;

module.exports = function boot() {
  return (new Config()).fromEnv().then(config => {
    const addonLoader = new AddonLoader(__dirname, pkg).load();
    const routes = buildRoutes(config);
    const profiles = buildProfiles(config);

    return new Server(config, addonLoader)
      .withProfiles(profiles)
      .withRoutes(routes)
      .start();
  });
};
