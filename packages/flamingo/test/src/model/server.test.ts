import assert = require("assert");
import path = require("path");
import got from "got";

import Server = require("../../../src/model/server");
import Config = require("../../../config");
import NoopAddonLoader = require("../../test-util/NoopAddonLoader");
import Route = require("../../../src/model/route");
import Loader = require("../../../src/addon/loader");
import IndexRoute = require("../../../src/routes/index");

describe("server", function () {
  it("#withRoutes throws when trying to add non Route routes", async function () {
    const config = await Config.fromEnv();
    const server = new Server(config, new NoopAddonLoader());
    const notARoute = {};
    assert.throws(() => server.withRoutes([notARoute as Route]));
  });

  it("#withRoutes doesn't throw when trying to add a Route routes", async function () {
    const config = await Config.fromEnv();
    const server = new Server(config, new NoopAddonLoader());
    server.withRoutes([new Route(config, "get", "/test")]);
    assert.ok(true);
  });

  it("registers plugins with the HAPI_PLUGINS hook", async function () {
    const config = await Config.fromEnv();
    const loader = new Loader(path.join(__dirname, "../../fixtures"), {
      dependencies: {
        "hapi-plugins-hook": "^0.1.0",
      },
    }).load();

    const PORT = 43723; // some random unused port

    const server = new Server({ ...config, PORT }, loader).withRoutes([
      new IndexRoute(config),
    ]);
    try {
      await server.start();
      const resp = await got(`http://localhost:${PORT}`);
      assert.strictEqual(resp.headers["foo"], "bar");
      assert.strictEqual(resp.headers["baz"], "42");
    } finally {
      await server.stop();
    }
  });
});
