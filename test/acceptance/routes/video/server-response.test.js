const assert = require('assert');
const merge = require('lodash/merge');
const simpleHttpServer = require('../../../test-util/simple-http-server');
const nock = require('nock');
const path = require('path');
const url = require('url');
const fs = require('fs');
const noop = require('lodash/noop');
const range = require('lodash/range');
const got = require('got');
const Promise = require('bluebird');

const Server = require('../../../../src/model/server');
const Config = require('../../../../config');

const exampleProfiles = require('../../../../src/profiles/examples');

const FLAMINGO_PORT = 43723; // some random unused port

function startServer(localConf) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, {CRYPTO: {ENABLED: false}, PORT: FLAMINGO_PORT}, localConf);

    if (config.CRYPTO.ENABLED) {
      // manually copy cipher, key, iv because they're buffers
      config.CRYPTO.KEY = Buffer.isBuffer(localConf.CRYPTO.KEY) ? localConf.CRYPTO.KEY : config.CRYPTO.KEY;
      config.CRYPTO.IV = Buffer.isBuffer(localConf.CRYPTO.IV) ? localConf.CRYPTO.IV : config.CRYPTO.IV;
    }

    return new Server(config, {hook: () => noop})
      .withProfiles([exampleProfiles])
      .withRoutes([new (require('../../../../src/routes/video'))(config)])
      .start();
  });
}

describe('video converting server response', function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', function () {
    return simpleHttpServer(function (req, res) {
      const code = parseInt(req.url.replace(/\//g, ''), 10);
      res.writeHead(code, {});
      res.end();
    }).then(httpServer => {
      const HOST = httpServer.address().address;
      const assetsUrl = url.format({protocol: 'http', hostname: HOST, port: httpServer.address().port});

      let server;
      const codes = range(400, 600);

      return startServer({
        HOST,
        ACCESS: {
          HTTPS: {
            ENABLED: true,
            READ: [{'hostname': 'errs.example.com'}]
          }
        }
      }).then(function (s) {
        server = s;

        return Promise.all(codes.map(code =>
          got(url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/video/avatar-image/${encodeURIComponent(`${assetsUrl}/${code}`)}`}))
            .catch(d => d)
        ));
      }).then(function (data) {
        data.forEach(response => assert.equal(response.statusCode, 400));
      }).finally(() => Promise.all([httpServer.stop(), server.stop()]));
    });
  });

  it('returns 400 for not whitelisted urls', function () {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent('https://old.example.com/test.ogv')}`;
    let server;

    return startServer({
      HOST: 'localhost',
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
    let HOST;
    let SERVER_PORT;
    return simpleHttpServer(function (req, res) {
      res.writeHead(301, {
        'Location': 'http://' + HOST + ':' + SERVER_PORT + '/movie.ogg'
      });
      res.end();
    }).then(httpServer => {
      HOST = httpServer.address().address;
      SERVER_PORT = httpServer.address().port;

      const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(`https://${HOST}:${SERVER_PORT}/moved.jpg`)}`;
      let server;

      return startServer({}).then(function (s) {
        server = s;

        return got(URL).catch(e => e);
      }).then(function (response) {
        assert.equal(response.statusCode, 400);
      }).finally(() => Promise.all([httpServer.stop(), server.stop()]));
    });
  });

  it('allows redirect if enabled', function () {
    const FILE_PATH = path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg');

    let SERVER_PORT;
    let HOST;
    return simpleHttpServer(function (req, res) {
      const urlPath = req.url.replace(/\//g, '');
      if (urlPath === 'moved.png') {
        res.writeHead(301, {
          'Location': url.format({protocol: 'http', hostname: HOST, port: SERVER_PORT, pathname: '/movie.ogg'})
        });
        res.end();
      } else {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      }
    }).then(httpServer => {
      HOST = httpServer.address().address;
      SERVER_PORT = httpServer.address().port;
      const assetsUrl = url.format({protocol: 'http', hostname: HOST, port: httpServer.address().port, pathname: '/moved.png'});
      const flamingoUrl = url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/video/avatar-image/${encodeURIComponent(assetsUrl)}`});

      let server;

      return startServer({
        HOST,
        ALLOW_READ_REDIRECT: true
      }).then(function (s) {
        server = s;

        return got(flamingoUrl);
      }).then(function (response) {
        assert.equal(response.statusCode, 200);
      }).finally(() => Promise.all([httpServer.stop(), server.stop()]));
    });
  });

  it('rejects unknown protocols (no reader available)', function () {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent('ftp://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('rejects unknown profile', function () {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/foo/${encodeURIComponent('http://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('fails for decryption errors', function () {
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent('http://ftp.example.com/moved.jpg')}`;
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
    const URL = `http://localhost:${FLAMINGO_PORT}/video/avatar-image/${encodeURIComponent(`file://${path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg')}`)}`;
    let server;

    return startServer({
      CRYPTO: {ENABLED: false},
      ACCESS: {FILE: {READ: [path.join(__dirname, '../../../fixtures/videos')]}}
    }).then(function (s) {
      server = s;

      return got(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => server.stop());
  });
});
