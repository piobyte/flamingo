import assert = require("assert");
import got from "got";
import merge = require("lodash/merge");

import Server = require("../../../../src/model/server");
import Config = require("../../../../config");
import NoopAddonLoader = require("../../../test-util/NoopAddonLoader");
import exampleProfiles = require("../../../../src/profiles/examples");
import DebugRoute = require("../../../../src/routes/debug");

const PORT = 43723; // some random unused port

async function startServer(localConf) {
  let config = await Config.fromEnv();
  config = merge({}, config, { PORT }, localConf);
  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([new DebugRoute(config)])
    .start();
}

describe("debug server response", function() {
  it("displays debug information if DEBUG is enabled", async function() {
    let server;

    try {
      server = await startServer({ DEBUG: true });
      const body: Record<string, any> = await got(
        `http://localhost:${PORT}/_debug`
      ).json();
      assert.equal(body.config.PORT, server.config.PORT);
    } finally {
      server.stop();
    }
  });
  it("displays debug information if DEBUG is enabled", async function() {
    let server;

    try {
      server = await startServer({ DEBUG: true });
      const body: Record<string, any> = await got(
        `http://localhost:${PORT}/_debug`
      ).json();
      return got(body.urls[0].url);
    } finally {
      server.stop();
    }
  });
});
