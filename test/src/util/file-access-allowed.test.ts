import assert = require('assert');
import fileAccessAllowed = require('../../../src/util/file-access-allowed');

describe('file access allowed', function() {
  it('allows whitelisted directories', function() {
    assert.ok(fileAccessAllowed('/my/allowed/path.png', ['/my/allowed']));
  });

  it('disallows not whitelisted directories', function() {
    assert.ok(!fileAccessAllowed('/my/not-allowed/path.png', ['/my/allowed']));
  });
});
