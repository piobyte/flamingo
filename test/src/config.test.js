var assert = require('assert'),
  conf = require('../../config'),
  merge = require('lodash/merge'),
  noop = require('lodash/noop'),
  RSVP = require('rsvp'),
  request = RSVP.denodeify(require('request')),
  server = require('../../src/server');

var PORT = 43726; // some random unused port

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


describe('config', function () {
  it('decrypts encrypted messages', function (done) {
    var PAYLOAD = 'test';

    conf.ENCODE_PAYLOAD(PAYLOAD).then(function (cipher) {
      return conf.DECODE_PAYLOAD(cipher);
    }).then(function (plain) {
      assert.strictEqual(plain, PAYLOAD);
      done();
    }).catch(done);
  });

  it('disables the index (fingerprinting) route', function (done) {
    var server;
    startServer({
      ROUTES: {INDEX: false}
    }).then(function (s) {
      server = s;
      return request('http://localhost:' + PORT + '/');
    }).then(function (response) {
      assert.equal(response.statusCode, 404);
      server.stop(done);
    }).catch(done);
  });

  it('disables the image convert route', function (done) {
    var server;
    startServer({
      ROUTES: {PROFILE_CONVERT_IMAGE: false}
    }).then(function (s) {
      server = s;
      return request('http://localhost:' + PORT + '/image/avatar-image/foo.png');
    }).then(function (response) {
      assert.equal(response.statusCode, 404);
      server.stop(done);
    }).catch(done);
  });

  it('disables the video convert route', function (done) {
    var server;
    startServer({
      ROUTES: {PROFILE_CONVERT_VIDEO: false}
    }).then(function (s) {
      server = s;
      return request('http://localhost:' + PORT + '/video/avatar-image/foo.png');
    }).then(function (response) {
      assert.equal(response.statusCode, 404);
      server.stop(done);
    }).catch(done);
  });

});
