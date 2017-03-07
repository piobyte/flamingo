import assert = require('assert');
import Promise = require('bluebird');
import sinon = require('sinon');
import merge = require('lodash/merge');
import noop = require('lodash/noop');
import got = require('got');

import Server = require('../../../src/model/server');
import Config = require('../../../config');
import NoopAddonLoader = require('../../test-util/NoopAddonLoader');
import Route = require('../../../src/model/route');

const HOST = 'localhost';
const PORT = 43723; // some random unused port

function startServer(localConf, route) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

    return new Server(config, new NoopAddonLoader())
      .withRoutes([route])
      .start();
  });
}

describe('convert', function() {
  it('handle throws if not implemented', function() {
    let _server;
    return startServer({}, new Route({}, 'GET', '/'))
      .then(server => {
        _server = server;

        return got(`http://${HOST}:${PORT}/`).catch(e => e);
      })
      .then(response => assert.equal(response.statusCode, 500))
      .finally(() => _server.stop());
  });

  it('#handleError called on hapi route handler buildOperation rejection', function() {
    const handleErrorSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle-error');
      }

      buildOperation(request, reply) {
        return Promise.reject('foo');
      }

      handleError(request, reply, error, operation) {
        handleErrorSpy(...arguments);
        super.handleError(request, reply, error, operation);
      }
    }

    return startServer({}, new TestRoute())
      .then(startedServer => {
        server = startedServer;
        return got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      })
      .then(() => {
        assert.ok(handleErrorSpy.called);
      })
      .finally(() => server.stop());
  });
  it('#handleError called on hapi route handler handle rejection', function() {
    const handleErrorSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle-error');
      }

      handle(Operation) {
        return Promise.reject('foo');
      }

      handleError(request, reply, error, operation) {
        handleErrorSpy(...arguments);
        super.handleError(request, reply, error, operation);
      }
    }

    return startServer({}, new TestRoute())
      .then(startedServer => {
        server = startedServer;
        return got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      })
      .then(() => {
        assert.ok(handleErrorSpy.called);
      })
      .finally(() => server.stop());
  });
  it('#handle is called for each request', function() {
    const handleSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle');
      }

      handle(operation) {
        handleSpy(...arguments);
        return Promise.resolve(operation.reply('ok'));
      }
    }

    return startServer({}, new TestRoute())
      .then(startedServer => {
        server = startedServer;
        return got(`http://${HOST}:${PORT}/handle`);
      })
      .then(() => {
        assert.ok(handleSpy.called);
      })
      .finally(() => server.stop());
  });
});
