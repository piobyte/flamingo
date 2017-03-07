import assert = require('assert');
import url = require('url');

import httpReader = require('../../../src/reader/https');
import fileReader = require('../../../src/reader/file');
import readerForUrl = require('../../../src/util/reader-for-url');

const httpsUrls = [
  'http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/',
  'http://example.org',
  'http://example.org:8080/',
  'https://example.org'
];
const fileUrls = ['file://localhost/etc/fstab'];
const unknownUrls = [
  'glob://ext/spl/examples/*.php',
  'ssh2.exec://user:pass@example.com:22/usr/local/bin/somecmd',
  'ssh2.shell://user:pass@example.com:22/xterm',
  'ogg://http://www.example.com/path/to/soundstream.ogg',
  'dict://locahost:11211/stats',
  'ldap://localhost:11211/%0astats%0aquit',
  'gopher://localhost:11211/1stats%0aquit',
  'gopher://localhost:10050/1vfs.file.regexp[/etc/hosts,7]',
  'gopher://localhost:8001/1POST%20%2fHTTP%2f1.1%0d%0aHost:localhost%0d%0aContent-Length:5%0d%0a%0d%0a',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
];

// some php related urls https://php.net/manual/en/wrappers.php
describe('reader-for-url', function() {
  it('checks for unknown readers', function() {
    unknownUrls.forEach(u =>
      assert.strictEqual(readerForUrl(url.parse(u)), undefined, u)
    );
  });

  it('returns https reader for https? urls', function() {
    httpsUrls.forEach(u =>
      assert.strictEqual(readerForUrl(url.parse(u)), httpReader, u)
    );
  });

  it('returns file reader for file urls', function() {
    fileUrls.forEach(u =>
      assert.strictEqual(readerForUrl(url.parse(u)), fileReader, u)
    );
  });
});
