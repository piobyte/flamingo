const sinon = require('sinon');
const assert = require('assert');

describe('unfold reader result test', function () {
  var method = require('../../../src/util/unfold-reader-result');

  it('checks that the method calls the stream function', function () {
    const streamSpy = sinon.stub().returns(true);
    const streamed = method({
      stream: streamSpy
    });

    assert.equal(streamed, true);
  });
});
