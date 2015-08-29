var assert = require('assert'),
  sinon = require('sinon'),
  addon = require('../../../src/addon'),
  path = require('path');

describe('hook', function () {
  var addons = require('../../../src/addon/loader');

  beforeEach(function () {
    addons.load(path.join(__dirname, '../../fixtures'), {
      dependencies: {
        'test-addon-0': '^0.1.0',
        'test-addon-1': '^0.1.0'
      }
    });
  });
  afterEach(function () {
    addons.unload();
  });

  it('should throw an error if an unregistered hook is called', function () {
    assert.throws(function () {
      addons.hook('LOREM_IPSUM');
    });
  });
  it('should do nothing if an registered hook is called without addons using it', function () {
    var spy = sinon.spy();
    addons.callback('WASD', spy);
    addons.hook('WASD');

    assert.ok(!spy.called);
  });

  describe('CONF', function () {
    it('should merge all addon configs into the initial config', function () {
      var conf = {FOO: 'bar'};

      addons.hook(addon.HOOKS.CONF)(conf);

      assert.deepEqual(conf, {
        FOO: 'bar',
        TEST_CONF: {ENABLED: true}
      });
    });
    it('shouldn\'t overwrite initial config fields', function () {
      var conf = {TEST_CONF: {ENABLED: false}};

      addons.hook(addon.HOOKS.CONF)(conf);

      assert.deepEqual(conf, {TEST_CONF: {ENABLED: false}});
    });
  });

  describe('ENV', function () {
    it('should handle environment variables', function () {
      var conf = {},
        env = {TEST_CONF_ENABLED: 'false'};

      addons.hook(addon.HOOKS.ENV)(conf, env);

      assert.deepEqual(conf, {TEST: {CONF: {ENABLED: false}}});
    });
  });

  describe('ROUTES', function () {
    it('should call the server.route method', function () {
      var server = {route: sinon.spy()};

      addons.hook(addon.HOOKS.ROUTES)(server);

      assert.ok(server.route.calledOn(server));
      assert.ok(server.route.called);
    });
  });

  describe('HAPI_PLUGINS', function () {
    it('should push plugins in the given plugins array', function () {
      var plugins = [];

      addons.hook(addon.HOOKS.HAPI_PLUGINS)(plugins);

      assert.ok(plugins.length === 1);
    });
  });

  describe('PROFILES', function () {
    it('should merge addon profiles in existing profile object', function () {
      var profiles = {
        addonProfile: true
      };

      addons.hook(addon.HOOKS.PROFILES)(profiles);

      assert.deepEqual(Object.keys(profiles), ['addonProfile', 'foo-bar']);
    });
  });

  describe('LOG_STREAM', function () {
    it('call the addStreams method of the logger', function () {
      var logger = {addStreams: sinon.spy()};

      addons.hook(addon.HOOKS.LOG_STREAM)(logger);

      assert.ok(logger.addStreams.called);
    });
  });
});
