const assert = require('assert');
const sinon = require('sinon');
const addon = require('../../../src/addon');
const path = require('path');
const Loader = require('../../../src/addon/loader');

function loader() {
  return new Loader(path.join(__dirname, '../../fixtures'), {
    dependencies: {
      'test-addon-0': '^0.1.0',
      'test-addon-1': '^0.1.0'
    }
  }).load();
}

describe('hook', function () {

  it('should throw an error if an unregistered hook is called', function () {
    assert.throws(function () {
      loader().hook('LOREM_IPSUM');
    });
  });
  it('should do nothing if an registered hook is called without addons using it', function () {
    var spy = sinon.spy();
    const l = loader();

    l.callback('WASD', spy);
    l.hook('WASD');

    assert.ok(!spy.called);
  });

  describe('CONF', function () {
    it('should merge all addon configs into the initial config', function () {
      var conf = {FOO: 'bar'};

      loader().hook(addon.HOOKS.CONF)(conf);

      assert.deepEqual(conf, {
        FOO: 'bar',
        TEST_CONF: {ENABLED: true}
      });
    });
    it('shouldn\'t overwrite initial config fields', function () {
      var conf = {TEST_CONF: {ENABLED: false}};

      loader().hook(addon.HOOKS.CONF)(conf);

      assert.deepEqual(conf, {TEST_CONF: {ENABLED: false}});
    });
    it('keeps buffer objects intact (https://github.com/lodash/lodash/issues/1453)', function () {
      const conf = {FOO: {Bar: new Buffer('uname -a', 'utf8')}};
      const EXPECTED = new Buffer('uname -a', 'utf8');

      loader().hook(addon.HOOKS.CONF)(conf);

      assert.ok(conf.FOO.Bar instanceof Buffer);
      assert.strictEqual(conf.FOO.Bar.toString(), EXPECTED.toString());
    });
  });

  describe('ENV', function () {
    it('should handle environment variables', function () {
      const conf = {};
      const env = {TEST_CONF_ENABLED: 'false'};

      loader().hook(addon.HOOKS.ENV)(conf, env);

      assert.deepEqual(conf, {TEST: {CONF: {ENABLED: false}}});
    });
  });

  describe('ROUTES', function () {
    it('should call the server.route method', function () {
      var server = {route: sinon.spy()};

      loader().hook(addon.HOOKS.ROUTES)(server);

      assert.ok(server.route.calledOn(server));
      assert.ok(server.route.called);
    });
  });

  describe('HAPI_PLUGINS', function () {
    it('should push plugins in the given plugins array', function () {
      var plugins = [];

      loader().hook(addon.HOOKS.HAPI_PLUGINS)(plugins);

      assert.ok(plugins.length === 1);
    });
  });

  describe('PROFILES', function () {
    it('should merge addon profiles in existing profile object', function () {
      var profiles = {
        addonProfile: true
      };

      loader().hook(addon.HOOKS.PROFILES)(profiles);

      assert.deepEqual(Object.keys(profiles), ['addonProfile', 'foo-bar']);
    });
  });

  describe('LOG_STREAM', function () {
    it('call the addStreams method of the logger', function () {
      var logger = {addStreams: sinon.spy()};

      loader().hook(addon.HOOKS.LOG_STREAM)(logger);

      assert.ok(logger.addStreams.called);
    });
  });
});
