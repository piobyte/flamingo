/* eslint-disable @typescript-eslint/ban-ts-comment */
import Server = require("flamingo/src/model/server");
import Config = require("flamingo/config");
import Loader = require("flamingo/src/addon/loader");
import got from "got";
import path = require("path");
import assert = require("assert");
// @ts-ignore
import merge = require("lodash.merge");
import IndexRoute = require("flamingo/src/routes/index");

const PORT = 9913;

function startServer(localConf = {}) {
  const loader = new Loader(path.join(__dirname, "../"), {});
  const addon = {
    path: path.join(__dirname, "../.."),
    pkg: require("../../package.json"),
  };
  return Config.fromEnv().then((config) => {
    const reduced = loader.reduceAddonsToHooks(
      [loader.resolvePkg(addon)!],
      loader._hooks
    );
    loader.finalize(reduced);
    return new Server(merge(config, localConf, { PORT }), loader)
      .withRoutes([new IndexRoute(config)])
      .start();
  });
}

describe("METRICS", function () {
  it("exposes metrics endpoint", async function () {
    const server = await startServer();

    try {
      await server.start();

      const resp = await got(`http://localhost:${PORT}/metrics`);
      assert.ok(resp.body.includes("http_requests_total"));
      assert.ok(resp.body.split("\n").find((l) => l === "up 1"));
    } finally {
      await server.stop();
    }
  });
});
