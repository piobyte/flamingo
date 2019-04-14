/* eslint-disable @typescript-eslint/ban-ts-ignore */
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
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle-error');
      }

      // @ts-ignore
      buildOperation(request, reply) {
        throw 'foo';
      }
    }

    try {
      server = await startServer({}, new TestRoute());
      sinon.spy(server, 'handleError');
      await got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      assert.ok(server.handleError.called);
    } finally {
      server.stop();
    }
  });
  it('#handleError called on hapi route handler handle rejection', async function() {
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle-error');
      }

      handle(Operation) {
        return Promise.reject('foo');
      }
    }

    try {
      server = await startServer({}, new TestRoute());
      sinon.spy(server, 'handleError');
      await got(`http://${HOST}:${PORT}/handle-error`).catch(e => e);
      assert.ok(server.handleError.called);
    } finally {
      server.stop();
    }
  });
  it('#handle is called for each request', async function() {
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, 'GET', '/handle');
      }

      handle(operation) {
        return Promise.resolve(operation.reply.send('ok'));
      }
    }

    try {
      const testRoute = new TestRoute();
      server = await startServer({}, testRoute);
      sinon.spy(testRoute, 'handle');
      await got(`http://${HOST}:${PORT}/handle`);
      // @ts-ignore
      assert.ok(testRoute.handle.called);
    } finally {
      server.stop();
    }
  });
});
