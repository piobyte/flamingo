var assert = require('assert');

describe('best-format', function () {
    var bestFormat = require('../../../src/util/best-format');
    //
    //it('should return webp if accept requests it', function () {
    //    // default webkit accept header
    //    assert.strictEqual(bestFormat('image/webp,*/*;q=0.8', 'image/png').mime, 'image/webp');
    //});

    it('should return first matching mime if accept requests it', function () {
        assert.strictEqual(bestFormat('image/jpeg,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5', 'image/png').mime, 'image/jpeg');
        // default MS accept header
        assert.strictEqual(bestFormat('image/png,image/*;q=0.8,*/*;q=0.5', 'image/png').mime, 'image/png');
        assert.strictEqual(bestFormat('image/jpeg,image/png,*/*;q=0.5', 'image/png').mime, 'image/jpeg');
    });

    it('should use default mime if wildcard accept header exists', function () {
        assert.strictEqual(bestFormat('*/*;q=0.8', 'image/png').mime, 'image/png');
        assert.strictEqual(bestFormat('*/*', 'image/png').mime, 'image/png');
    });

    it('should work with non image accept headers', function () {
        assert.strictEqual(bestFormat('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'image/png').mime, 'image/png');
    });

    it('should use default mime if no accept header exists', function () {
        assert.strictEqual(bestFormat('', 'image/png').mime, 'image/png');
        assert.strictEqual(bestFormat(undefined, 'image/png').mime, 'image/png');
        assert.strictEqual(bestFormat(null, 'image/png').mime, 'image/png');
    });
});
