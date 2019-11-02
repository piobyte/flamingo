import assert = require("assert");
import merge = require("lodash/merge");
import path = require("path");
import fs = require("fs");
import got = require("got");
import url = require("url");

import exampleProfiles = require("../../../../src/profiles/examples");
import simpleHttpServer = require("../../../test-util/simple-http-server");
import Server = require("../../../../src/model/server");
import Config = require("../../../../config");
import NoopAddonLoader = require("../../../test-util/NoopAddonLoader");
import Index = require("../../../../src/routes/index");
import Video = require("../../../../src/routes/video");
import Image = require("../../../../src/routes/image");

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

describe("convert video", function() {
  it("creates an image from an ogg video", async function() {
    const SRC_FILE = "trailer_1080p.ogg";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;
    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } }
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it.skip("creates an image from an mp4 video", async function() {
    // TODO: ProcessingError: Uncaught error: ffmpeg exited with code 1: Error opening filters!
    const SRC_FILE = "trailer_1080p.mp4";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } }
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("creates an image from an avi video", async function() {
    const SRC_FILE = "trailer_1080p.avi";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } }
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("creates an image from an quicktime video", async function() {
    const SRC_FILE = "trailer_1080p.mov";
    const FILE_PATH = path.join(
      __dirname,
      "../../../fixtures/videos",
      SRC_FILE
    );

    let flamingoServer;
    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });
    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } }
      });
      const data = await got(flamingoUrl);
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });

  it("rejects on ffprobe errors", async function() {
    const SRC_FILE = "convert-video.test.js";
    const FILE_PATH = path.join(__dirname, SRC_FILE);

    let flamingoServer;
    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });
    const HOST = httpServer.address().address;

    const assetsUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: httpServer.address().port
    });
    const flamingoUrl = url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    try {
      flamingoServer = await startServer({
        HOST,
        ACCESS: { HTTPS: { ENABLED: false } }
      });
      const data = await got(flamingoUrl).catch(e => e);
      assert.ok(data);
      assert.equal(data.statusCode, 400);
    } finally {
      await Promise.all([httpServer.stop(), flamingoServer.stop()]);
    }
  });
});
