const assert = require('assert');
const merge = require('lodash/merge');
const noop = require('lodash/noop');
const got = require('got');
const exampleProfiles = require('../../src/profiles/examples');

const Server = require('../../src/model/server');
const Config = require('../../config');

const PORT = 43726; // some random unused port

function startServer(localConf) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, {CRYPTO: {ENABLED: false}, PORT: PORT}, localConf);

    if (config.CRYPTO.ENABLED) {
      // manually copy cipher, key, iv because they're buffers
      config.CRYPTO.KEY = Buffer.isBuffer(localConf.CRYPTO.KEY) ? localConf.CRYPTO.KEY : config.CRYPTO.KEY;
      config.CRYPTO.IV = Buffer.isBuffer(localConf.CRYPTO.IV) ? localConf.CRYPTO.IV : config.CRYPTO.IV;
    }

    return new Server(config, {hook: () => noop})
      .withProfiles([exampleProfiles])
      .withRoutes([])
      .start();
  });
}


describe('config', function () {
  it('decrypts encrypted messages', function () {
    const PAYLOAD = 'test';

    return Config.fromEnv().then(conf => {
      return conf.ENCODE_PAYLOAD(PAYLOAD).then(function (cipher) {
        return conf.DECODE_PAYLOAD(cipher);
      }).then(function (plain) {
        assert.strictEqual(plain, PAYLOAD);
      });
    });
  });

  it('has no index (fingerprinting) route by default', function () {
    let server;
    return startServer({
      ROUTES: {INDEX: false}
    }).then(function (s) {
      server = s;
      return got('http://localhost:' + PORT + '/').catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 404);
    }).finally(() => server.stop());
  });

  it('#fromEnv', function(){
    const env = {
      TEST: 'true'
    };
    const mappings = [
      ['TEST', 'TEST', (val) => val === 'true']
    ];
    return Config.fromEnv(env, mappings).then(config => {
      assert.equal(config.TEST, true);
    });
  });
});
