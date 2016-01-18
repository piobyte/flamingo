var assert = require('assert'),
  loader = require('../../src/addon/loader'),
  addon = require('../../src/addon'),
  conf = require('../../config'),
  request = require('request');

describe('server', function () {
  var server = require('../../src/server'),
    port = 43723;

  it('exposes a flamingoOperation for each request', function (done) {
    var routeAddon = {
      pkg: {name: 'test-route'},
      hooks: {}
    };

    routeAddon.hooks[addon.HOOKS.ROUTES] = function () {
      return [{
        method: 'GET',
        path: '/foo',
        config: {
          cors: true,
          description: 'Testing route to check for flamingoOperation existence.',
          handler: function (req) {
            assert.ok(req.flamingoOperation);
            assert.equal(typeof req.flamingoOperation.request, 'object');
            loader.unload();
            done();
          }
        }
      }];
    };

    loader.finalize(loader,
      loader.registerAddonHooks([routeAddon], {}));

    conf.PORT = port;
    server(conf, loader).then(function () {
      request('http://localhost:' + port + '/foo');
    });
  });
});
