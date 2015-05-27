var assert = require('assert');

describe('file access allowed', function () {
    var fileAccessAllowed = require('../../../src/util/file-access-allowed');

    it('allows whitelisted directories', function () {
        assert.ok(fileAccessAllowed('/my/allowed/path.png', ['/my/allowed']));
    });

    it('disallows not whitelisted directories', function () {
        assert.throws(function () {
            fileAccessAllowed('/my/not-allowed/path.png', ['/my/allowed']);
        });
    });
});
