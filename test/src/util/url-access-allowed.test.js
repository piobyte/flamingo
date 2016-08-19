const assert = require('assert');
const url = require('url');

describe('read access allowed', function () {
  const readAllowed = require('../../../src/util/url-access-allowed');

  it('disallows all urls for an empty whitelist', function () {
    assert.ok(!readAllowed(url.parse('gopher://foobar:11211/1stats%0aquit'), []));
  });

  it('allows whitelisted urls', function () {
    assert.ok(readAllowed(url.parse('gopher://foobar:11211/1stats%0aquit'), [{hostname: 'foobar'}]));
    assert.ok(readAllowed(url.parse('http://wikipedia.org/'), [{hostname: 'wikipedia.org'}]));
    assert.ok(readAllowed(url.parse('http://127.0.0.1/'), [{hostname: '127.0.0.1'}]));
  });

  it('disallows not whitelisted urls', function () {
    assert.ok(!readAllowed(url.parse('gopher://foobar:11211/1stats%0aquit'), [{protocol: 'https:'}]));
    assert.ok(!readAllowed(url.parse('http://wikipedia.org/'), [{protocol: 'https:'}]));
  });

  it('supports complex whitelists', function () {
    const COMPLEX_WHITELIST = [{
      protocol: 'ssh2.exec:',
      auth: 'user:pass',
      port: '22',
      pathname: '/usr/local/bin/somecmd'
    }];

    assert.ok(readAllowed(url.parse('ssh2.exec://user:pass@example.com:22/usr/local/bin/somecmd'), COMPLEX_WHITELIST));
    assert.ok(readAllowed(url.parse('ssh2.exec://user:pass@google.com:22/usr/local/bin/somecmd'), COMPLEX_WHITELIST));
    assert.ok(!readAllowed(url.parse('ssh2.exec://user:pass@example.com:22/usr/local/bin/vips'), COMPLEX_WHITELIST));
    assert.ok(!readAllowed(url.parse('ssh2.exec://user:pass@example.com/usr/local/bin/somecmd'), COMPLEX_WHITELIST));
  });
});
