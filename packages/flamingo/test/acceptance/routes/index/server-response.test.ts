import assert = require("assert");
import got from "got";
import merge = require("lodash/merge");

import Server = require("../../../../src/model/server");
import Config = require("../../../../config");
import exampleProfiles = require("../../../../src/profiles/examples");
import NoopAddonLoader = require("../../../test-util/NoopAddonLoader");
import IndexRoute = require("../../../../src/routes/index");

const PORT = 43723; // some random unused port

async function startServer(localConf) {
  let config = await Config.fromEnv();

  config = merge({}, config, { PORT }, localConf);
  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([new IndexRoute(config)])
    .start();
}

describe("index server response", function () {
  it("returns a banner for /", async function () {
    let server;

    try {
      server = await startServer({ DEBUG: false });
      const response = await got("http://localhost:" + PORT);
      assert.strictEqual(response.statusCode, 200);
      assert.ok(
        response.body.indexOf("debug") === -1,
        "isn't showing debug information if disabled"
      );
    } finally {
      server.stop();
    }
  });

  it("displays debug information if DEBUG is enabled", async function () {
    let server;

    try {
      server = await startServer({ DEBUG: true });
      const response = await got(`http://localhost:${PORT}`);
      assert.ok(response.body.indexOf("debug") !== -1);
    } finally {
      server.stop();
    }
  });
});
