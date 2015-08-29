var assert = require('assert'),
  httpReader = require('../../../src/reader/https'),
  dataReader = require('../../../src/reader/data'),
  fileReader = require('../../../src/reader/file'),
  url = require('url');

var IPV6_URL_0 = url.parse('http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/'),
  HTTP_URL_0 = url.parse('http://example.org'),
  HTTP_URL_1 = url.parse('http://example.org:8080/'),
  HTTPS_URL_0 = url.parse('https://example.org'),

  DATA_URL_0 = url.parse('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='),

  FILE_URL_0 = url.parse('file://localhost/etc/fstab'),

// some php related urls https://php.net/manual/en/wrappers.php
  GLOB_URL_0 = url.parse('glob://ext/spl/examples/*.php'),
  SSH2_URL_0 = url.parse('ssh2.exec://user:pass@example.com:22/usr/local/bin/somecmd'),
  SSH2_URL_1 = url.parse('ssh2.shell://user:pass@example.com:22/xterm'),
  OGG_URL_0 = url.parse('ogg://http://www.example.com/path/to/soundstream.ogg'),

  DICT_URL_0 = url.parse('dict://locahost:11211/stats'),
  LDAP_URL_0 = url.parse('ldap://localhost:11211/%0astats%0aquit'),
  GOPHER_URL_0 = url.parse('gopher://localhost:11211/1stats%0aquit'),
  GOPHER_URL_1 = url.parse('gopher://localhost:10050/1vfs.file.regexp[/etc/hosts,7]'),
  GOPHER_URL_2 = url.parse('gopher://localhost:8001/1POST%20%2fHTTP%2f1.1%0d%0aHost:localhost%0d%0aContent-Length:5%0d%0a%0d%0a');

describe('reader-for-url', function () {
  var readerForUrl = require('../../../src/util/reader-for-url');

  it('checks for unknown readers', function () {
    assert.strictEqual(readerForUrl(url.parse(DICT_URL_0)), undefined);
    assert.strictEqual(readerForUrl(url.parse(LDAP_URL_0)), undefined);
    assert.strictEqual(readerForUrl(url.parse(GOPHER_URL_0)), undefined);
    assert.strictEqual(readerForUrl(url.parse(GOPHER_URL_1)), undefined);
    assert.strictEqual(readerForUrl(url.parse(GOPHER_URL_2)), undefined);

    assert.strictEqual(readerForUrl(url.parse(GLOB_URL_0)), undefined);
    assert.strictEqual(readerForUrl(url.parse(SSH2_URL_0)), undefined);
    assert.strictEqual(readerForUrl(url.parse(SSH2_URL_1)), undefined);
    assert.strictEqual(readerForUrl(url.parse(OGG_URL_0)), undefined);
  });

  it('returns https reader for https? urls', function () {
    assert.strictEqual(readerForUrl(url.parse(HTTP_URL_0)), httpReader);
    assert.strictEqual(readerForUrl(url.parse(HTTP_URL_1)), httpReader);
    assert.strictEqual(readerForUrl(url.parse(HTTPS_URL_0)), httpReader);
  });

  it('returns data reader for data urls', function () {
    assert.strictEqual(readerForUrl(url.parse(DATA_URL_0)), dataReader);
  });

  it('returns file reader for file urls', function () {
    assert.strictEqual(readerForUrl(url.parse(FILE_URL_0)), fileReader);
  });

  it('works with ipv6 urls', function () {
    assert.strictEqual(readerForUrl(url.parse(IPV6_URL_0)), httpReader);
  });
});
