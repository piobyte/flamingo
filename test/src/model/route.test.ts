import assert = require('assert');
import sinon = require('sinon');
import merge = require('lodash/merge');
import got = require('got');

import Server = require('../../../src/model/server');
import Config = require('../../../config');
import NoopAddonLoader = require('../../test-util/NoopAddonLoader');
import Route = require('../../../src/model/route');

const HOST = 'localhost';
const PORT = 43723; // some random unused port

async function startServer(localConf, route) {
  let config = await Config.fromEnv();
  config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

  return new Server(config, new NoopAddonLoader()).withRoutes([route]).start();
}

describe('convert', function() {
  it('handle throws if not implemented', async function() {
    let _server;
    try {
      _server = await startServer({}, new Route({}, 'GET', '/'));
      const { statusCode } = await got(`http://${HOST}:${PORT}/`).catch(e => e);
      assert.equal(statusCode, 500);
    } finally {
      _server.stop();
    }
  });

  it('#handleError called on hapi route handler buildOperation rejection', async function() {
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

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      assert.ok(handleErrorSpy.called);
    } finally {
      server.stop();
    }
  });
  it('#handleError called on hapi route handler handle rejection', async function() {
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

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      assert.ok(handleErrorSpy.called);
    } finally {
      server.stop();
    }
  });
  it('#handle is called for each request', async function() {
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

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle`);
      assert.ok(handleSpy.called);
    } finally {
      server.stop();
    }
  });
});
