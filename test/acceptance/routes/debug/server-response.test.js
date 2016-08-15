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
      .withRoutes([new (require('../../../../src/routes/debug'))(config)])
      .start();
  });
}

describe('debug server response', function () {
  it('displays debug information if DEBUG is enabled', function () {
    let server;

    return startServer({DEBUG: true}).then(function (s) {
      server = s;

      return got(`http://localhost:${PORT}/_debug`, {json: true});
    }).then(function (response) {
      assert.equal(response.body.config.PORT, server.config.PORT);
    }).finally(() => server.stop());
  });
  it('displays debug information if DEBUG is enabled', function () {
    let server;

    return startServer({DEBUG: true}).then(function (s) {
      server = s;

      return got(`http://localhost:${PORT}/_debug`, {json: true})
        .then(response => got(response.body.urls[0].url));
    }).finally(() => server.stop());
  });
});
