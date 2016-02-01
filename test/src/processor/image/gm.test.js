const assert = require('assert');
const temp = require('temp');
const FlamingoOperation = require('../../../../src/model/flamingo-operation');
const fs = require('fs');

describe('gm processor', function () {
  before(function () {
    temp.track();
  });
  after(function (done) {
    temp.cleanup(done);
  });

  var gmProcessor = require('../../../../src/processor/image/gm');

  it('should work without throwing an error', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    const op = new FlamingoOperation();
    let processedStream;

    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    processedStream = gmProcessor(op, function (pipe) {
      return pipe.gravity('Center');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    const op = new FlamingoOperation();
    let processedStream;

    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    processedStream = gmProcessor(op, function (pipe) {
      return pipe.options({imageMagick: true}).setFormat('webp');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
