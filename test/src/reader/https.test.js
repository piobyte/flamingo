/* global describe, it */

var url = require('url'),
    temp = require('temp'),
    nock = require('nock'),
    assert = require('assert');

var httpReader = require('../../../src/reader/https');
var EXAMPLE_ACCESS = {HTTPS: {ENABLED: true, READ: [{hostname: 'example.org'}]}};

describe('https? reader', function () {
    it('resolves the expected result', function (done) {
        nock('http://example.org/')
            .get('/ok')
            .reply(200, {status: 'OK'});

        httpReader(url.parse('http://example.org/ok'), EXAMPLE_ACCESS).then(function (data) {
            assert.ok(!!data.stream);
            var buf = [],
                out = temp.createWriteStream();

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

        httpReader(url.parse('http://example.org/bad'), EXAMPLE_ACCESS).then(function (data) {
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
        nock.disableNetConnect();
        httpReader(url.parse('http://example.org/'), EXAMPLE_ACCESS).then(function (data) {
            assert.ok(!!data.stream);
            data.stream().then(function () {
                done('shouldn\'t resolve this request.');
            }, function (reason) {
                assert.equal(reason.signal, 'http://example.org/');
                done();
            });
        });
    });

    it('rejects not whitelisted url if access filter is enabled', function (done) {
        nock.disableNetConnect();
        httpReader(url.parse('http://example.org/'), {HTTPS: {ENABLED: true, READ: []}}).then(function () {
            done('shouldn\'t resolve this request.');
        }, function () {
            done();
        });
    });
    it('resolves not whitelisted url if access filter is disabled', function (done) {
        nock.disableNetConnect();
        httpReader(url.parse('http://example.org/'), {HTTPS: {ENABLED: false, READ: []}}).then(function () {
            done();
        });
    });
});
