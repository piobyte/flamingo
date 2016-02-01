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

    var op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS
    });
    op.targetUrl = url.parse('http://example.org/ok');

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

  it('rejects for statusCode >= 400', function (done) {
    nock('http://example.org/')
      .get('/bad')
      .reply(400, {status: 'Bad Request'});

    var op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS
    });
    op.targetUrl = url.parse('http://example.org/bad');

    httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      data.stream().then(function () {
        done('shouldn\'t resolve this request.');
      }, function () {
        assert.ok(true);
        done();
      });
    });
  });

  it('sets the url for error requests', function (done) {
    nock('http://example.org/')
      .get('/bad')
      .reply(400, {status: 'Bad Request'});

    var op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: false}}
    });
    op.targetUrl = url.parse('http://example.org/bad');

    httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      data.stream().then(function () {
        done('shouldn\'t resolve this request.');
      }, function (reason) {
        assert.equal(reason.extra, 'http://example.org/bad');
        done();
      });
    });
  });

  it('rejects not whitelisted url if access filter is enabled', function (done) {
    nock.disableNetConnect();

    var op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: true, READ: []}}
    });
    op.targetUrl = url.parse('http://example.org/bad');

    httpReader(op).then(function () {
      done('shouldn\'t resolve this request.');
    }, function () {
      done();
    });
  });
  it('resolves not whitelisted url if access filter is disabled', function (done) {
    nock.disableNetConnect();

    var op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: {HTTPS: {ENABLED: false, READ: []}}
    });
    op.targetUrl = url.parse('http://example.org/');

    httpReader(op).then(function () {
      done();
    });
  });
});
