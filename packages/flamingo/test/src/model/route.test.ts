/* eslint-disable prefer-rest-params */
import assert = require("assert");
import sinon = require("sinon");
import merge = require("lodash/merge");
import got from "got";
import Hapi = require("@hapi/hapi");

import Server = require("../../../src/model/server");
import Config = require("../../../config");
import NoopAddonLoader = require("../../test-util/NoopAddonLoader");
import Route = require("../../../src/model/route");
import FlamingoOperation = require("../../../src/model/flamingo-operation");

const HOST = "localhost";
const PORT = 43723; // some random unused port

async function startServer(localConf: Config, route: Route) {
  let config = await Config.fromEnv();
  config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

  return new Server(config, new NoopAddonLoader()).withRoutes([route]).start();
}

describe("convert", function () {
  it("handle throws if not implemented", async function () {
    let _server;
    try {
      _server = await startServer({}, new Route({}, "GET", "/"));
      const { response } = await got(`http://${HOST}:${PORT}/`).catch((e) => e);
      assert.strictEqual(response.statusCode, 500);
    } finally {
      _server?.stop();
    }
  });

  it("#handleError called on hapi route handler buildOperation rejection", async function () {
    const handleErrorSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, "GET", "/handle-error");
      }

      buildOperation(request: Hapi.Request, reply: Hapi.ResponseToolkit) {
        return Promise.reject("foo");
      }

      handleError(
        request: Hapi.Request,
        reply: Hapi.ResponseToolkit,
        error: Error,
        operation: FlamingoOperation
      ) {
        handleErrorSpy(...arguments);
        return super.handleError(request, reply, error, operation);
      }
    }

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle-error`).catch((e) => e);
      assert.ok(handleErrorSpy.called);
    } finally {
      server?.stop();
    }
  });
  it("#handleError called on hapi route handler handle rejection", async function () {
    const handleErrorSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, "GET", "/handle-error");
      }

      handle(operation: FlamingoOperation) {
        return Promise.reject("foo");
      }

      handleError(
        request: Hapi.Request,
        reply: Hapi.ResponseToolkit,
        error: Error,
        operation: FlamingoOperation
      ) {
        handleErrorSpy(...arguments);
        return super.handleError(request, reply, error, operation);
      }
    }

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle-error`).catch((e) => e);
      assert.ok(handleErrorSpy.called);
    } finally {
      server?.stop();
    }
  });
  it("#handle is called for each request", async function () {
    const handleSpy = sinon.spy();
    let server;

    class TestRoute extends Route {
      constructor() {
        super({}, "GET", "/handle");
      }

      handle(operation: FlamingoOperation) {
        handleSpy(...arguments);
        return Promise.resolve(operation.reply.response("ok"));
      }
    }

    try {
      server = await startServer({}, new TestRoute());
      await got(`http://${HOST}:${PORT}/handle`);
      assert.ok(handleSpy.called);
    } finally {
      server?.stop();
    }
  });
});
