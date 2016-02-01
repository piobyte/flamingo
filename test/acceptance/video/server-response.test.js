const assert = require('assert');
const merge = require('lodash/merge');
const simpleHttpServer = require('../../test-util/simple-http-server');
const nock = require('nock');
const path = require('path');
const fs = require('fs');
const noop = require('lodash/noop');
const range = require('lodash/range');
const got = require('got');
const Promise = require('bluebird');

const Server = require('../../../src/model/server');
const Config = require('../../../config');

const exampleProfiles = require('../../../src/profiles/examples');

var PORT = 43723; // some random unused port
var encode = function (plain) {
  return encodeURIComponent(new Buffer(plain).toString('base64'));
};

function startServer(localConf) {
  return new Config().fromEnv().then(config => {
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
      .start().catch(e => console.error(e));
  });
}

describe('video converting server response', function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', function () {
    const HOST = 'localhost';
    const SERVER_PORT = PORT + 1;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      var code = parseInt(req.url.replace(/\//g, ''), 10);
      res.writeHead(code, {});
      res.end();
    });
    let server;
    const codes = range(400, 600);

    return startServer({
      ACCESS: {
        HTTPS: {
          ENABLED: true,
          READ: [{'hostname': 'errs.example.com'}]
        }
      }
    }).then(function (s) {
      server = s;

      return Promise.all(codes.map(code =>
        got(`http://localhost:${PORT}/video/avatar-image/${encode(`http://${HOST}:${SERVER_PORT}/${code}`)}`)
          .catch(d => d)
      ));
    }).then(function (data) {
      data.forEach(response => assert.equal(response.statusCode, 400));
    }).finally(() => Promise.all([httpServer.stop(), server.stop()])).catch(e => console.error(e));
  });

  it('returns 400 for not whitelisted urls', function () {
    const URL = `http://localhost:${PORT}/video/avatar-image/${encode('https://old.example.com/test.ogv')}`;
    let server;

    return startServer({
      ACCESS: {
        HTTPS: {
          ENABLED: true,
          READ: [{'hostname': 'errs.example.com'}]
        }
      }
    }).then(function (s) {
      server = s;

      return got(URL).catch(d => d);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('rejects redirects by default', function () {
    const HOST = 'localhost';
    const SERVER_PORT = PORT + 1;
    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      res.writeHead(301, {
        'Location': 'http://' + HOST + ':' + SERVER_PORT + '/movie.ogg'
      });
      res.end();
    });

    const URL = `http://localhost:${PORT}/video/avatar-image/${encode(`https://${HOST}:${SERVER_PORT}/moved.jpg`)}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => Promise.all([httpServer.stop(), server.stop()]));
  });

  it('allows redirect if enabled', function () {
    const HOST = 'localhost';
    const SERVER_PORT = PORT + 1;
    const FILE_PATH = path.join(__dirname, '../../fixtures/videos/trailer_1080p.ogg');

    const httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
      var urlPath = req.url.replace(/\//g, '');
      if (urlPath === 'moved.png') {
        res.writeHead(301, {
          'Location': 'http://' + HOST + ':' + SERVER_PORT + '/movie.ogg'
        });
        res.end();
      } else {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      }
    });

    const URL = `http://localhost:${PORT}/video/avatar-image/${encode(`http://localhost:${SERVER_PORT}/moved.png`)}`;
    let server;

    return startServer({
      ALLOW_READ_REDIRECT: true
    }).then(function (s) {
      server = s;

      return got(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => Promise.all([httpServer.stop(), server.stop()]));
  });

  it('rejects unknown protocols (no reader available)', function () {
    const URL = `http://localhost:${PORT}/video/avatar-image/${encode('ftp://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('rejects unknown profile', function () {
    const URL = `http://localhost:${PORT}/video/foo/${encode('http://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('fails for decryption errors', function () {
    const URL = `http://localhost:${PORT}/video/avatar-image/${encode('http://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({
      CRYPTO: {ENABLED: true}
    }).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('uses the file reader for file uris', function () {
    const URL = `http://localhost:${PORT}/video/avatar-image/${encode(`file://${path.join(__dirname, '../../fixtures/videos/trailer_1080p.ogg')}`)}`;
    let server;

    return startServer({
      CRYPTO: {ENABLED: false},
      ACCESS: {FILE: {READ: [path.join(__dirname, '../../fixtures/videos')]}}
    }).then(function (s) {
      server = s;

      return got(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => server.stop());
  });
});
