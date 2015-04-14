var assert = require('assert');

describe('file access allowed result test', function () {
    var fileAccessAllowed = require('../../../src/util/file-access-allowed');

    it('checks whitelisted directories resolve', function () {
        assert.ok(fileAccessAllowed('/my/allowed/path.png', ['/my/allowed']));
    });

    it('check whitelisted directories reject', function () {
        assert.throws(function () {
            fileAccessAllowed('/my/not-allowed/path.png', ['/my/allowed']);
        });
    });
});
