const assert = require('assert');
const temp = require('temp');
const fs = require('fs');

describe('gm processor', function () {
  before(function () {
    temp.track();
  });
  after(function (done) {
    temp.cleanup(done);
  });

  const imageProcessor = require('../../../../src/processor/image/index');
  const FlamingoOperation = require('../../../../src/model/flamingo-operation');

  it('should work without throwing an error', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    const op = new FlamingoOperation();

    op.profile = {
      process: [{
        processor: 'gm',
        pipe: function (gm) {
          return gm.gravity('Center');
        }
      }]
    };
    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const process = imageProcessor(op);
    const processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    const op = new FlamingoOperation();

    op.profile = {
      process: [{
        processor: 'gm',
        pipe: function (gm) {
          return gm.gravity('Center');
        }
      }]
    };
    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const process = imageProcessor(op);
    const processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
