import assert = require('assert');
import merge = require('lodash/merge');
import noop = require('lodash/noop');
import path = require('path');
import fs = require('fs');
import got = require('got');
import url = require('url');
import Promise = require('bluebird');

import exampleProfiles = require('../../../../src/profiles/examples');
import simpleHttpServer = require('../../../test-util/simple-http-server');
import Server = require('../../../../src/model/server');
import Config = require('../../../../config');
import NoopAddonLoader = require('../../../test-util/NoopAddonLoader');
import Index = require('../../../../src/routes/index');
import Video = require('../../../../src/routes/video');
import Image = require('../../../../src/routes/image');

const FLAMINGO_PORT = 43723; // some random unused port

function startServer(localConf) {
  return Config.fromEnv().then(config => {
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
  });
}

describe('convert video', function() {
  it('creates an image from an ogg video', function() {
    const SRC_FILE = 'trailer_1080p.ogg';
    const FILE_PATH = path.join(
      __dirname,
      '../../../fixtures/videos',
      SRC_FILE
    );

    let flamingoServer;
    return simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    }).then(httpServer => {
      const HOST = httpServer.address().address;
      const assetsUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: httpServer.address().port
      });
      const flamingoUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: FLAMINGO_PORT,
        pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
      });

      return startServer({ HOST, ACCESS: { HTTPS: { ENABLED: false } } })
        .then(function(s) {
          flamingoServer = s;

          return got(flamingoUrl);
        })
        .then(function(data) {
          assert.ok(data);
          assert.equal(data.statusCode, 200);
        })
        .finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
    });
  });

  it.skip('creates an image from an mp4 video', function() {
    // TODO: ProcessingError: Uncaught error: ffmpeg exited with code 1: Error opening filters!
    const SRC_FILE = 'trailer_1080p.mp4';
    const FILE_PATH = path.join(
      __dirname,
      '../../../fixtures/videos',
      SRC_FILE
    );

    let flamingoServer;
    return simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    }).then(httpServer => {
      const HOST = httpServer.address().address;

      const assetsUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: httpServer.address().port
      });
      const flamingoUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: FLAMINGO_PORT,
        pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
      });

      return startServer({ HOST, ACCESS: { HTTPS: { ENABLED: false } } })
        .then(function(s) {
          flamingoServer = s;

          return got(flamingoUrl);
        })
        .then(function(data) {
          assert.ok(data);
          assert.equal(data.statusCode, 200);
        })
        .finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
    });
  });

  it('creates an image from an avi video', function() {
    const SRC_FILE = 'trailer_1080p.avi';
    const FILE_PATH = path.join(
      __dirname,
      '../../../fixtures/videos',
      SRC_FILE
    );

    let flamingoServer;
    return simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    }).then(httpServer => {
      const HOST = httpServer.address().address;

      const assetsUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: httpServer.address().port
      });
      const flamingoUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: FLAMINGO_PORT,
        pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
      });

      return startServer({ HOST, ACCESS: { HTTPS: { ENABLED: false } } })
        .then(function(s) {
          flamingoServer = s;

          return got(flamingoUrl);
        })
        .then(function(data) {
          assert.ok(data);
          assert.equal(data.statusCode, 200);
        })
        .finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
    });
  });

  it('creates an image from an quicktime video', function() {
    const SRC_FILE = 'trailer_1080p.mov';
    const FILE_PATH = path.join(
      __dirname,
      '../../../fixtures/videos',
      SRC_FILE
    );

    let flamingoServer;
    return simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    }).then(httpServer => {
      const HOST = httpServer.address().address;

      const assetsUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: httpServer.address().port
      });
      const flamingoUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: FLAMINGO_PORT,
        pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
      });

      return startServer({ HOST, ACCESS: { HTTPS: { ENABLED: false } } })
        .then(function(s) {
          flamingoServer = s;

          return got(flamingoUrl);
        })
        .then(function(data) {
          assert.ok(data);
          assert.equal(data.statusCode, 200);
        })
        .finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
    });
  });

  it('rejects on ffprobe errors', function() {
    const SRC_FILE = 'convert-video.test.js';
    const FILE_PATH = path.join(__dirname, SRC_FILE);

    let flamingoServer;
    return simpleHttpServer(function(req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    }).then(httpServer => {
      const HOST = httpServer.address().address;

      const assetsUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: httpServer.address().port
      });
      const flamingoUrl = url.format({
        protocol: 'http',
        hostname: HOST,
        port: FLAMINGO_PORT,
        pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
      });

      return startServer({ HOST, ACCESS: { HTTPS: { ENABLED: false } } })
        .then(function(s) {
          flamingoServer = s;

          return got(flamingoUrl).catch(e => e);
        })
        .then(function(data) {
          assert.ok(data);
          assert.equal(data.statusCode, 400);
        })
        .finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
    });
  });
});
