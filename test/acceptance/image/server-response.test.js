const assert = require('assert');
const merge = require('lodash/merge');
const nock = require('nock');
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

describe('image converting server response', function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('returns 400 for all target error codes', function () {
    let server;
    const codes = range(400, 600);
    let endpoint = nock('https://errs.example.com');

    codes.forEach(code =>
      endpoint = endpoint.get('/' + code).reply(code, {}));

    return startServer({
      ACCESS: {
        HTTPS: {
          ENABLED: true,
          READ: [{'hostname': 'errs.example.com'}]
        }
      }
    }).then(function (s) {
      server = s;

      return Promise.all(
        codes.map((code) =>
          got(`http://localhost:${PORT}/image/avatar-image/${encode(`https://errs.example.com/${code}`)}`, {
            retries: 0,
            followRedirect: false
          }).catch(data => data)));
    }).then(function (data) {
      data.forEach((response) =>
        assert.equal(response.statusCode, 400));
    }).finally(() => server.stop());
  });

  it('returns 400 for not whitelisted urls', function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encode('https://old.example.com/image.png')}`;
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

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('rejects redirects by default', function () {
    nock('https://redir.example.com')
      .get('/moved.jpg')
      .reply(301, {status: 'moved'}, {
        Location: 'https://redir.example.com/url.jpg'
      });

    const URL = `http://localhost:${PORT}/image/avatar-image/${encode('https://redir.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('allows redirect if enabled', function () {
    nock('https://redir.example.com')
      .get('/moved.png')
      .reply(301, {status: 'moved'}, {
        Location: 'https://redir.example.com/url.png'
      })
      .get('/url.png')
      .replyWithFile(200, __dirname + '/../../fixtures/images/base64.png');

    const URL = `http://localhost:${PORT}/image/avatar-image/${encode('https://redir.example.com/moved.png')}`;
    let server;

    return startServer({
      ALLOW_READ_REDIRECT: true
    }).then(function (s) {
      server = s;

      return got(URL);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => server.stop());
  });

  it('rejects unknown protocols (no reader available)', function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encode('ftp://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('rejects unknown profile', function () {
    const URL = `http://localhost:${PORT}/image/foo/${encode('http://ftp.example.com/moved.jpg')}`;
    let server;

    return startServer({}).then(function (s) {
      server = s;

      return got(URL).catch(e => e);
    }).then(function (response) {
      assert.equal(response.statusCode, 400);
    }).finally(() => server.stop());
  });

  it('fails for decryption errors', function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encode('http://ftp.example.com/moved.jpg')}`;
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
  
  it('returns a banner for /', function () {
    let server;

    return startServer({
      CRYPTO: {ENABLED: true}
    }).then(function (s) {
      server = s;

      return got('http://localhost:' + PORT);
    }).then(function (response) {
      assert.equal(response.statusCode, 200);
    }).finally(() => server.stop());
  });
});
