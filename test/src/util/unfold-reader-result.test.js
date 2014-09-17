var sinon = require('sinon'),
    assert = require('assert');

describe('unfold reader result test', function () {
    var method = require('../../../src/util/unfold-reader-result');

    it('checks that the method calls the stream function', function () {
        var streamSpy = sinon.stub().returns(true),
            streamed = method({
                stream: streamSpy
            });

        assert.equal(streamed, true);
    });
});
