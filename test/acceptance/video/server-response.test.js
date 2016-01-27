var assert = require('assert'),
  server = require('../../../src/server'),
  conf = require('../../../config'),
  merge = require('lodash/merge'),
  simpleHttpServer = require('../../test-util/simple-http-server'),
  nock = require('nock'),
  RSVP = require('rsvp'),
  request = RSVP.denodeify(require('request')),
  path = require('path'),
  fs = require('fs'),
  noop = require('lodash/noop'),
  range = require('lodash/range');

var PORT = 43723; // some random unused port
var encode = function (plain) {
  return encodeURIComponent(new Buffer(plain).toString('base64'));
};

function startServer(localConf) {
  var serverConf = merge({}, conf, {
    CRYPTO: {ENABLED: false},
    PORT: PORT
  }, localConf);

  if (serverConf.CRYPTO.ENABLED) {
    // manually copy cipher, key, iv because they're buffers
    serverConf.CRYPTO.KEY = Buffer.isBuffer(localConf.CRYPTO.KEY) ? localConf.CRYPTO.KEY : conf.CRYPTO.KEY;
    serverConf.CRYPTO.IV = Buffer.isBuffer(localConf.CRYPTO.IV) ? localConf.CRYPTO.IV : conf.CRYPTO.IV;
  }

  return server(serverConf, {
    hook: function () {
      return noop;
    }
  });
}

describe('video converting server response', function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', function (done) {
    var HOST = 'localhost',
      SERVER_PORT = PORT + 1,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        var code = parseInt(req.url.replace(/\//g, ''), 10);
        res.writeHead(code, {});
        res.end();
      }),
      server,
      codes = range(400, 600);

    startServer({
      ACCESS: {
        HTTPS: {
          ENABLED: true,
          READ: [{'hostname': 'errs.example.com'}]
        }
      }
    }).then(function (s) {
      server = s;

      return RSVP.all(codes.map(function (code) {
        return request('http://localhost:' + PORT + '/video/avatar-image/' +
          encode('http://' + HOST + ':' + SERVER_PORT + '/' + code));
      }));

    }).then(function (data) {

      data.forEach(function (response) {
        assert.equal(response.statusCode, 400);
      });

      return RSVP.all([
        RSVP.denodeify(server.stop.bind(server))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('returns 400 for not whitelisted urls', function (done) {
    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('https://old.example.com/test.ogv'),
      server;

    startServer({
      ACCESS: {
        HTTPS: {
          ENABLED: true,
          READ: [{'hostname': 'errs.example.com'}]
        }
      }
    }).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
      server.stop(done);
    });
  });

  it('rejects redirects by default', function (done) {
    var HOST = 'localhost',
      SERVER_PORT = PORT + 1,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(301, {
          'Location': 'http://' + HOST + ':' + SERVER_PORT + '/movie.ogg'
        });
        res.end();
      });

    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('https://' + HOST + ':' + SERVER_PORT + '/moved.jpg'),
      server;

    startServer({}).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);

      return RSVP.all([
        RSVP.denodeify(server.stop.bind(server))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it.skip('allows redirect if enabled', function (done) {
    var HOST = 'localhost',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos/trailer_1080p.ogg'),

      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
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

    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('http://localhost:' + SERVER_PORT + '/moved.png'),
      server;

    startServer({
      ALLOW_READ_REDIRECT: true
    }).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(server.stop.bind(server))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('rejects unknown protocols (no reader available)', function (done) {
    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('ftp://ftp.example.com/moved.jpg'),
      server;

    startServer({}).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
      server.stop(done);
    }).catch(done);
  });

  it('rejects unknown profile', function (done) {
    var URL = 'http://localhost:' + PORT + '/video/foo/' +
        encode('http://ftp.example.com/moved.jpg'),
      server;

    startServer({}).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
      server.stop(done);
    }).catch(done);
  });

  it('fails for decryption errors', function (done) {
    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('http://ftp.example.com/moved.jpg'),
      server;

    startServer({
      CRYPTO: {ENABLED: true}
    }).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
      server.stop(done);
    }).catch(done);
  });

  it('uses the file reader for file uris', function (done) {
    var URL = 'http://localhost:' + PORT + '/video/avatar-image/' +
        encode('file://' + path.join(__dirname, '../../fixtures/videos/trailer_1080p.ogg')),
      server;

    startServer({
      CRYPTO: {ENABLED: false},
      ACCESS: {FILE: {READ: [path.join(__dirname, '../../fixtures/videos')]}}
    }).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
      server.stop(done);
    }).catch(done);
  });
});
