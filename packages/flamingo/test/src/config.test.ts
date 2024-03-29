import assert = require("assert");
import merge = require("lodash/merge");
import got from "got";

import exampleProfiles = require("../../src/profiles/examples");
import Server = require("../../src/model/server");
import Config = require("../../config");
import AddonLoader = require("../../src/addon/loader");
import Mapping from "../../src/types/Mapping";

const PORT = 43726; // some random unused port

class NoopAddonLoader extends AddonLoader {
  constructor() {
    super("", {});
  }

  hook(hookName: string) {
    return () => [];
  }
}

async function startServer(localConf: Config) {
  let config = await Config.fromEnv();
  config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([])
    .start();
}

describe("config", function () {
  it("has no index (fingerprinting) route by default", async function () {
    let server;

    try {
      server = await startServer({
        ROUTES: { INDEX: false },
      });
      const { response } = await got("http://localhost:" + PORT + "/").catch(
        (e) => e
      );
      assert.strictEqual(response.statusCode, 404);
    } finally {
      server?.stop();
    }
  });

  it("#fromEnv", async function () {
    const env = {
      TEST: "true",
    };
    const mappings: Array<Mapping> = [
      ["TEST", "TEST", (val) => val === "true"],
    ];

    const config = await Config.fromEnv(env, mappings);
    assert.strictEqual(config.TEST, true);
  });
});
