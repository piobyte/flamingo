import sinon = require('sinon');
import assert = require('assert');

import unfoldReaderResult = require('../../../src/util/unfold-reader-result');
import ReaderType = require('../../../src/model/reader-type');

describe('unfold reader result test', function() {
  it('checks that the method calls the stream function', function() {
    const streamSpy = sinon.stub().returns(true);

    const streamed = unfoldReaderResult({
      stream: streamSpy,
      type: ReaderType.FILE,
      path: ''
    });

    assert.equal(streamed, true);
  });
});
