const assert = require('assert');
const noop = require('lodash/noop');
const got = require('got');
const merge = require('lodash/merge');

const Server = require('../../../../src/model/server');
const Config = require('../../../../config');

const exampleProfiles = require('../../../../src/profiles/examples');

const PORT = 43723; // some random unused port

function startServer(localConf = {}) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, {PORT}, localConf);
    return new Server(config, {addons: [], hook: () => noop})
      .withProfiles([exampleProfiles])
      .withRoutes([new (require('../../../../src/routes/index'))(config)])
      .start();
  });
}

describe('index server response', function () {
  it('returns a banner for /', function () {
    let server;

    return startServer().then(function (s) {
      server = s;

      return got('http://localhost:' + PORT);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => server.stop());
  });
});
