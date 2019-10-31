import assert = require("assert");

import Server = require("../../../src/model/server");
import Config = require("../../../config");
import NoopAddonLoader = require("../../test-util/NoopAddonLoader");
import Route = require("../../../src/model/route");

describe("server", function() {
  it("#withRoutes throws when trying to add non Route routes", async function() {
    const config = await Config.fromEnv();
    const server = new Server(config, new NoopAddonLoader());
    const notARoute = {};
    assert.throws(() => server.withRoutes([notARoute as Route]));
  });

  it("#withRoutes doesn't throw when trying to add a Route routes", async function() {
    const config = await Config.fromEnv();
    const server = new Server(config, new NoopAddonLoader());
    server.withRoutes([new Route(config, "get", "/test")]);
    assert.ok(true);
  });
});
