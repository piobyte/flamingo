const url = require('url');
const temp = require('temp');
const nock = require('nock');
const merge = require('lodash/merge');
const assert = require('assert');

const httpReader = require('../../../src/reader/https');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const EXAMPLE_ACCESS = {HTTPS: {ENABLED: true, READ: [{hostname: 'example.org'}]}};
const DEFAULT_CONF = {
  READER: {
    REQUEST: {
      TIMEOUT: 10 * 1000
    }
  }
};

describe('https? reader', function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it('resolves the expected result', function (done) {
    nock('http://example.org/')
      .get('/ok')
      .reply(200, {status: 'OK'});

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS
    });
    op.input = url.parse('http://example.org/ok');

    httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      const buf = [];
      const out = temp.createWriteStream();

      data.stream().then(function (stream) {
        stream.on('data', function (e) {
          buf.push(e);
        });
        stream.on('end', function () {
          assert.equal(Buffer.concat(buf).toString('utf8'),
            '{"status":"OK"}');
          done();
        });
        stream.pipe(out);
      });
    });
  });

  it('rejects for statusCode >= 400', function () {
    nock('http://example.org/')
      .get('/bad')
      .reply(400, {status: 'Bad Request'});

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS
    });
    op.input = url.parse('http://example.org/bad');

    return httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      return data.stream().then(
        () => assert.ok(false, 'shouldn\'t resolve this request.'),
        () => assert.ok(true));
    });
  });

  it('sets the url for error requests', function () {
    nock('http://example.org/')
      .get('/bad')
      .reply(400, {status: 'Bad Request'});

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: false}}
    });
    op.input = url.parse('http://example.org/bad');

    return httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      return data.stream().then(
        () => assert.ok(false, 'shouldn\'t resolve this request.'),
        (reason) => assert.equal(reason.extra, 'http://example.org/bad'));
    });
  });

  it('rejects not whitelisted url if access filter is enabled', function () {
    nock.disableNetConnect();

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: true, READ: []}}
    });
    op.input = url.parse('http://example.org/bad');

    return httpReader(op).then(
      () => assert.ok(false, 'shouldn\'t resolve this request.'),
      () => assert.ok(true));
  });
  it('resolves not whitelisted url if access filter is disabled', function () {
    nock.disableNetConnect();

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: false, READ: []}}
    });
    op.input = url.parse('http://example.org/');

    return httpReader(op);
  });
});
