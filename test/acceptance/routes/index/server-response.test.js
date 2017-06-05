const assert = require('assert');
const noop = require('lodash/noop');
const got = require('got');
const merge = require('lodash/merge');

const Server = require('../../../../src/model/server');
const Config = require('../../../../config');

const exampleProfiles = require('../../../../src/profiles/examples');

const PORT = 43723; // some random unused port

function startServer(localConf) {
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

    return startServer({DEBUG: false}).then(function (s) {
      server = s;

      return got('http://localhost:' + PORT);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
      assert.ok(response.body.indexOf('debug') === -1, 'isn\'t showing debug information if disabled');
    }).finally(() => server.stop());
  });

  it('displays debug information if DEBUG is enabled', function () {
    let server;

    return startServer({DEBUG: true}).then(function (s) {
      server = s;

      return got('http://localhost:' + PORT);
    }).then(function (response) {
      // TODO: maybe query DOM for debug div
      assert.ok(response.body.indexOf('debug') !== -1);
    }).finally(() => server.stop());
  });
});
