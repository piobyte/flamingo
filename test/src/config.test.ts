import assert = require('assert');
import merge = require('lodash/merge');
import got = require('got');

import exampleProfiles = require('../../src/profiles/examples');
import Server = require('../../src/model/server');
import Config = require('../../config');
import AddonLoader = require('../../src/addon/loader');
import Mapping from '../../src/types/Mapping';

const PORT = 43726; // some random unused port

class NoopAddonLoader extends AddonLoader {
  constructor() {
    super('', {});
  }
  hook(hookName: string) {
    return () => [];
  }
}

function startServer(localConf) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

    return new Server(config, new NoopAddonLoader())
      .withProfiles([exampleProfiles])
      .withRoutes([])
      .start();
  });
}

describe('config', function() {
  it('has no index (fingerprinting) route by default', function() {
    let server;
    return startServer({
      ROUTES: { INDEX: false }
    })
      .then(function(s) {
        server = s;
        return got('http://localhost:' + PORT + '/').catch(e => e);
      })
      .then(function(response) {
        assert.equal(response.statusCode, 404);
      })
      .finally(() => server.stop());
  });

  it('#fromEnv', function() {
    const env = {
      TEST: 'true'
    };
    const mappings: Array<Mapping> = [['TEST', 'TEST', val => val === 'true']];
    return Config.fromEnv(env, mappings).then(config => {
      assert.equal(config.TEST, true);
    });
  });
});
