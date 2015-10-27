var assert = require('assert'),
  server = require('../../../src/server'),
  conf = require('../../../config'),
  merge = require('lodash/object/merge'),
  simpleHttpServer = require('../../test-util/simple-http-server'),
  RSVP = require('rsvp'),
  request = RSVP.denodeify(require('request')),
  noop = require('lodash/utility/noop'),
  path = require('path'),
  fs = require('fs');

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

describe('convert video', function () {
  it('creates an image from an ogg video', function (done) {
    var SRC_FILE = 'trailer_1080p.ogg',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('creates an image from an mp4 video', function (done) {
    var SRC_FILE = 'trailer_1080p.mp4',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('creates an image from an flv video', function (done) {
    var SRC_FILE = 'trailer_1080p.flv',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('creates an image from an avi video', function (done) {
    var SRC_FILE = 'trailer_1080p.avi',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('creates an image from an quicktime video', function (done) {
    var SRC_FILE = 'trailer_1080p.mov',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('allows usage of the deprecated video route', function (done) {
    var SRC_FILE = 'trailer_1080p.mov',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, '../../fixtures/videos', SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/convert/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 200);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('rejects on ffprobe errors', function (done) {
    var SRC_FILE = 'convert-video.test.js',
      HOST = '127.0.0.1',
      SERVER_PORT = PORT + 1,
      FILE_PATH = path.join(__dirname, SRC_FILE);

    var flamingoServer,
      httpServer = simpleHttpServer(HOST, SERVER_PORT, function (req, res) {
        res.writeHead(200, {});
        fs.createReadStream(FILE_PATH).pipe(res);
      });

    startServer({ACCESS: {HTTPS: {ENABLED: false}}}).then(function (s) {
      flamingoServer = s;

      return request('http://' + HOST + ':' + PORT + '/video/avatar-image/' +
        encode('http://' + HOST + ':' + SERVER_PORT));
    }).then(function (data) {
      assert.ok(data);
      assert.equal(data.statusCode, 400);

      return RSVP.all([
        RSVP.denodeify(flamingoServer.stop.bind(flamingoServer))(),
        RSVP.denodeify(httpServer.close.bind(httpServer))()
      ]).then(function () {
        done();
      });
    }).catch(done);
  });
});
