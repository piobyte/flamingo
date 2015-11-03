var assert = require('assert'),
  server = require('../../../src/server'),
  conf = require('../../../config'),
  merge = require('lodash/object/merge'),
  nock = require('nock'),
  RSVP = require('rsvp'),
  request = RSVP.denodeify(require('request')),
  noop = require('lodash/utility/noop'),
  range = require('lodash/utility/range');

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

describe('image converting server response', function () {
  afterEach(function () {
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', function (done) {
    var server;
    var codes = range(400, 600),
      endpoint = nock('https://errs.example.com');

    codes.forEach(function (code) {
      endpoint = endpoint.get('/' + code).reply(code, {});
    });

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
        return request('http://localhost:' + PORT + '/image/avatar-image/' +
          encode('https://errs.example.com/' + code));
      }));

    }).then(function (data) {

      data.forEach(function (response) {
        assert.equal(response.statusCode, 400);
      });

      server.stop(done);
    }).catch(done);
  });

  it('allows usage of the deprecated image route', function (done) {
    var URL = 'http://localhost:' + PORT + '/convert/image/avatar-image/' +
        encode('https://old.example.com/image.png'),
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

  it('returns 400 for not whitelisted urls', function (done) {
    var URL = 'http://localhost:' + PORT + '/image/avatar-image/' +
        encode('https://old.example.com/image.png'),
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
    nock('https://redir.example.com')
      .get('/moved.jpg').reply(301, {status: 'moved'}, {
        'Location': 'https://redir.example.com/url.jpg'
      });

    var URL = 'http://localhost:' + PORT + '/image/avatar-image/' +
        encode('https://redir.example.com/moved.jpg'),
      server;

    startServer({}).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
      server.stop(done);
    }).catch(done);
  });

  it('allows redirect if enabled', function (done) {
    nock('https://redir.example.com')
      .get('/moved.png')
      .reply(301, {status: 'moved'}, {
        'Location': 'https://redir.example.com/url.png'
      })
      .get('/url.png')
      .replyWithFile(200, __dirname + '/../../fixtures/images/base64.png');

    var URL = 'http://localhost:' + PORT + '/image/avatar-image/' +
        encode('https://redir.example.com/moved.png'),
      server;

    startServer({
      ALLOW_READ_REDIRECT: true
    }).then(function (s) {
      server = s;

      return request(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
      server.stop(done);
    }).catch(done);
  });

  it('rejects unknown protocols (no reader available)', function (done) {
    var URL = 'http://localhost:' + PORT + '/image/avatar-image/' +
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
    var URL = 'http://localhost:' + PORT + '/image/foo/' +
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
    var URL = 'http://localhost:' + PORT + '/image/avatar-image/' +
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

  it('returns a banner for /', function (done) {
    var server;

    startServer({
      CRYPTO: {ENABLED: true}
    }).then(function (s) {
      server = s;

      return request('http://localhost:' + PORT);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
      server.stop(done);
    }).catch(done);
  });
});
