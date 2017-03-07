import assert = require('assert');
import cipher = require('../../../src/util/cipher');

const { encode, decode } = cipher;

describe('cipher', function() {
  it('#encode', function() {
    const payload = 'test';
    const cipher = 'BF-CBC';
    const key = new Buffer('DjiZ7AWTeNh38zoQiZ76gw::', 'base64');
    const iv = new Buffer('_ag3WU77');

    return encode(payload, cipher, key, iv)
      .then(encoded => decode(encoded, cipher, key, iv))
      .then(plain => assert.strictEqual(plain, payload));
  });
});
