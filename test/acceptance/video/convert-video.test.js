const assert = require('assert');
const merge = require('lodash/merge');
const simpleHttpServer = require('../../test-util/simple-http-server');
const noop = require('lodash/noop');
const path = require('path');
const fs = require('fs');
const got = require('got');
const exampleProfiles = require('../../../src/profiles/examples');

const Server = require('../../../src/model/server');
const Config = require('../../../config');

var PORT = 43723; // some random unused port
var encode = function (plain) {
  return encodeURIComponent(new Buffer(plain).toString('base64'));
};


function startServer(localConf) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, {CRYPTO: {ENABLED: false}, PORT: PORT}, localConf);

    if (config.CRYPTO.ENABLED) {
      // manually copy cipher, key, iv because they're buffers
      config.CRYPTO.KEY = Buffer.isBuffer(localConf.CRYPTO.KEY) ? localConf.CRYPTO.KEY : config.CRYPTO.KEY;
      config.CRYPTO.IV = Buffer.isBuffer(localConf.CRYPTO.IV) ? localConf.CRYPTO.IV : config.CRYPTO.IV;
    }

    return new Server(config, {hook: () => noop})
      .withProfiles([exampleProfiles])
      .withRoutes([
        new (require('../../../src/routes/index'))(config),
        new (require('../../../src/routes/image'))(config),
        new (require('../../../src/routes/video'))(config)
      ])
      .start();
  });
}

describe('convert video', function () {
  it('creates an image from an ogg video', function () {
    const SRC_FILE = 'trailer_1080p.ogg';
    const HOST = '127.0.0.1';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    let flamingoServer;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    return startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return got(`http://${HOST}:${PORT}/video/avatar-image/${encode(`http://${HOST}:${SERVER_PORT}`)}`);
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    }).finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
  });

  it.skip('creates an image from an mp4 video', function () {
    // TODO: ProcessingError: Uncaught error: ffmpeg exited with code 1: Error opening filters!
    const SRC_FILE = 'trailer_1080p.mp4';
    const HOST = '127.0.0.1';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    let flamingoServer;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    return startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return got(`http://${HOST}:${PORT}/video/avatar-image/${encode(`http://${HOST}:${SERVER_PORT}`)}`);
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    }).finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
  });

  it('creates an image from an avi video', function () {
    const SRC_FILE = 'trailer_1080p.avi';
    const HOST = '127.0.0.1';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    let flamingoServer;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    return startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return got(`http://${HOST}:${PORT}/video/avatar-image/${encode(`http://${HOST}:${SERVER_PORT}`)}`);
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    }).finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
  });

  it('creates an image from an quicktime video', function () {
    const SRC_FILE = 'trailer_1080p.mov';
    const HOST = '127.0.0.1';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    let flamingoServer;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    return startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return got('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);
    }).finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
  });

  it('rejects on ffprobe errors', function () {
    const SRC_FILE = 'convert-video.test.js';
    const HOST = '127.0.0.1';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, SRC_FILE);

    let flamingoServer;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(200, {});
      fs.createReadStream(FILE_PATH).pipe(res);
    });

    return startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return got('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT)).catch(e => e);
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 400);
    }).finally(() => Promise.all([httpServer.stop(), flamingoServer.stop()]));
  });
});
