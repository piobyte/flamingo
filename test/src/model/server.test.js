const assert = require('assert');
const Server = require('../../../src/model/server');
const Route = require('../../../src/model/route');
const Config = require('../../../config');
const noop = require('lodash/noop');

describe('server', function () {
  it('#withRoutes throws when trying to add non Route routes', function () {
    return Config.fromEnv().then(config => {
      const server = new Server(config, {hook: ()=> noop});
      const notARoute = {};
      assert.throws(()=>
        server.withRoutes([notARoute]));
    });
  });

  it('#withRoutes doesn\'t throw when trying to add a Route routes', function () {
    return Config.fromEnv().then(config => {
      const server = new Server(config, {hook: ()=> noop});
      server.withRoutes([new Route(config, 'get', '/test')]);
      assert.ok(true);
    });
  });
});
