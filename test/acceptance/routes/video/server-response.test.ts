import assert = require('assert');
import merge = require('lodash/merge');
import nock = require('nock');
import path = require('path');
import url = require('url');
import fs = require('fs');
import range = require('lodash/range');
import got = require('got');

import simpleHttpServer = require('../../../test-util/simple-http-server');
import Server = require('../../../../src/model/server');
import Config = require('../../../../config');
import exampleProfiles = require('../../../../src/profiles/examples');
import NoopAddonLoader = require('../../../test-util/NoopAddonLoader');
import VideoRoute = require('../../../../src/routes/video');

const FLAMINGO_PORT = 43723; // some random unused port

async function startServer(localConf) {
  let config = await Config.fromEnv();
  config = merge(
    {},
    config,
    { CRYPTO: { ENABLED: false }, PORT: FLAMINGO_PORT },
    localConf
  );

  if (config.CRYPTO!.ENABLED) {
    // manually copy cipher, key, iv because they're buffers
    config.CRYPTO!.KEY = Buffer.isBuffer(localConf.CRYPTO.KEY)
      ? localConf.CRYPTO.KEY
      : config.CRYPTO!.KEY;
    config.CRYPTO!.IV = Buffer.isBuffer(localConf.CRYPTO.IV)
      ? localConf.CRYPTO.IV
      : config.CRYPTO!.IV;
  }

  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([new VideoRoute(config)])
    .start();
}

describe('video converting server response', function() {
  afterEach(function() {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', async function() {
    const httpServer = await simpleHttpServer(function(req, res) {
      const code = parseInt(req.url.replace(/\//g, ''), 10);
      res.writeHead(code, {});
      res.end();
    });

    const HOST = httpServer.address().address;
    const assetsUrl = url.format({
      protocol: 'http',
      hostname: HOST,
      port: httpServer.address().port
    });

    let server;
    const codes = range(400, 600);

    try {
      server = await startServer({
        HOST,
        ACCESS: {
          HTTPS: {
            ENABLED: true,
            READ: [{ hostname: 'errs.example.com' }]
          }
        }
      });
      const data = await Promise.all(
        codes.map(code =>
          got(
            url.format({
              protocol: 'http',
              hostname: HOST,
              port: FLAMINGO_PORT,
              pathname: `/video/avatar-image/${encodeURIComponent(
                `${assetsUrl}/${code}`
              )}`
            })
          ).catch(d => d)
        )
      );
      data.forEach(response => assert.equal(response.statusCode, 400));
    } finally {
      await Promise.all([httpServer.stop(), server.stop()]);
    }
  });

  it('returns 400 for not whitelisted urls', async function() {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(
      'https://old.example.com/test.ogv'
    )}`;
    let server;

    try {
      server = await startServer({
        HOST: 'localhost',
        ACCESS: {
          HTTPS: {
            ENABLED: true,
            READ: [{ hostname: 'errs.example.com' }]
          }
        }
      });
      const { statusCode } = await got(URL).catch(d => d);
      assert.equal(statusCode, 400);
    } finally {
      server.stop();
    }
  });

  it('rejects redirects by default', async function() {
    let HOST;
    let SERVER_PORT;

    const httpServer = await simpleHttpServer(function(req, res) {
      res.writeHead(301, {
        Location: 'http://' + HOST + ':' + SERVER_PORT + '/movie.ogg'
      });
      res.end();
    });

    HOST = httpServer.address().address;
    SERVER_PORT = httpServer.address().port;

    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(
      `https://${HOST}:${SERVER_PORT}/moved.jpg`
    )}`;
    let server;

    try {
      server = await startServer({});
      const { statusCode } = await got(URL).catch(e => e);
      assert.equal(statusCode, 400);
    } finally {
      await Promise.all([httpServer.stop(), server.stop()]);
    }
  });

  it('allows redirect if enabled', async function() {
    const FILE_PATH = path.join(
      __dirname,
      '../../../fixtures/videos/trailer_1080p.ogg'
    );

    let SERVER_PORT;
    let HOST;
    const httpServer = await simpleHttpServer(function(req, res) {
      const urlPath = req.url.replace(/\//g, '');
      if (urlPath === 'moved.png') {
        res.writeHead(301, {
          Location: url.format({
            protocol: 'http',
            hostname: HOST,
            port: SERVER_PORT,
            pathname: '/movie.ogg'
          })
        });
        res.end();
      } else {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      }
    });
    HOST = httpServer.address().address;
    SERVER_PORT = httpServer.address().port;
    const assetsUrl = url.format({
      protocol: 'http',
      hostname: HOST,
      port: httpServer.address().port,
      pathname: '/moved.png'
    });
    const flamingoUrl = url.format({
      protocol: 'http',
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`
    });

    let server;

    try {
      server = await startServer({
        HOST,
        ALLOW_READ_REDIRECT: true
      });
      const { statusCode } = await got(flamingoUrl);
      assert.equal(statusCode, 200);
    } finally {
      await Promise.all([httpServer.stop(), server.stop()]);
    }
  });

  it('rejects unknown protocols (no reader available)', async function() {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(
      'ftp://ftp.example.com/moved.jpg'
    )}`;
    let server;

    try {
      server = await startServer({});
      const { statusCode } = await got(URL).catch(e => e);
      assert.equal(statusCode, 400);
    } finally {
      server.stop();
    }
  });

  it('rejects unknown profile', async function() {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/foo/${encodeURIComponent(
      'http://ftp.example.com/moved.jpg'
    )}`;
    let server;

    try {
      server = await startServer({});
      const { statusCode } = await got(URL).catch(e => e);
      assert.equal(statusCode, 400);
    } finally {
      server.stop();
    }
  });

  it('fails for decryption errors', async function() {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(
      'http://ftp.example.com/moved.jpg'
    )}`;
    let server;

    try {
      server = await startServer({
        CRYPTO: { ENABLED: true }
      });
      const { statusCode } = await got(URL).catch(e => e);
      assert.equal(statusCode, 400);
    } finally {
      server.stop();
    }
  });

  it('uses the file reader for file uris', async function() {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(
      `file://${path.join(
        __dirname,
        '../../../fixtures/videos/trailer_1080p.ogg'
      )}`
    )}`;
    let server;

    try {
      server = await startServer({
        CRYPTO: { ENABLED: false },
        ACCESS: {
          FILE: { READ: [path.join(__dirname, '../../../fixtures/videos')] }
        }
      });
      const { statusCode } = await got(URL);
      assert.equal(statusCode, 200);
    } finally {
      server.stop();
    }
  });
});
