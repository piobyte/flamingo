import assert = require("assert");
import merge = require("lodash/merge");
import path = require("path");
import fs = require("fs");
import got from "got";
import url = require("url");

import exampleProfiles = require("../../../../src/profiles/examples");
import simpleHttpServer = require("../../../test-util/simple-http-server");
import Server = require("../../../../src/model/server");
import Config = require("../../../../config");
import NoopAddonLoader = require("../../../test-util/NoopAddonLoader");
import Index = require("../../../../src/routes/index");
import Video = require("../../../../src/routes/video");
import Image = require("../../../../src/routes/image");
import FlamingoOperation = require("../../../../src/model/flamingo-operation");

const FLAMINGO_PORT = 43723; // some random unused port

async function startServer(localConf) {
  let config = await Config.fromEnv();
  config = merge(
    {},
    config,
    { CRYPTO: { ENABLED: false }, PORT: FLAMINGO_PORT },
    localConf
  );

  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([new Index(config), new Image(config), new Video(config)])
    .start();
}

describe("convert video", function () {
  it.only("supports streams as input", async function () {
    class StreamingVideo extends Video {
      extractInput = () => Promise.resolve(url.parse("http://zombo.com"));

      extractReader() {
        return Promise.resolve(() => ({
          stream: () =>
            Promise.resolve(
              fs.createReadStream(
                path.join(
                  __dirname,
                  "../../../fixtures/videos/trailer_1080p.ogg"
                )
              )
            ),
          type: "stream",
        }));
      }
    }

    async function startServer() {
      let config = await Config.fromEnv();
      config = merge({}, config, {
        CRYPTO: { ENABLED: false },
        HOST: "localhost",
        PORT: FLAMINGO_PORT,
        ACCESS: { HTTPS: { ENABLED: false } },
      });

      return new Server(config, new NoopAddonLoader())
        .withProfiles([exampleProfiles])
        .withRoutes([new StreamingVideo(config)])
        .start();
    }

    const flamingoUrl = url.format({
      protocol: "http",
      hostname: "localhost",
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/http%3A%2F%2Fzombo.com%2F`,
    });

    let flamingoServer;
    try {
      flamingoServer = await startServer();
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.strictEqual(data.statusCode, 200);
    } finally {
      await flamingoServer.stop();
    }
  });

  it("creates an image from an ogg video", async function () {
    const SRC_FILE = "trailer_1080p.ogg";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;
    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port,
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`,
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } },
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.strictEqual(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it.skip("creates an image from an mp4 video", async function () {
    // TODO: ProcessingError: Uncaught error: ffmpeg exited with code 1: Error opening filters!
    const SRC_FILE = "trailer_1080p.mp4";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port,
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`,
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } },
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.strictEqual(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("creates an image from an avi video", async function () {
    const SRC_FILE = "trailer_1080p.avi";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port,
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`,
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } },
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.strictEqual(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("creates an image from an quicktime video", async function () {
    const SRC_FILE = "trailer_1080p.mov";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });
    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port,
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`,
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } },
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.strictEqual(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("rejects on ffprobe errors", async function () {
    const SRC_FILE = "convert-video.test.js";
    const FILE_PATH = path.join(__dirname, SRC_FILE);

    let flamingoServer;
    const httpServer = await simpleHttpServer(function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });
    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port,
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`,
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } },
      });
      const { response } = await got(flamingoUrl).catch((e) => e);
      assert.strictEqual(response.statusCode, 400);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });
});
