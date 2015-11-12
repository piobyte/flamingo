var assert = require('assert'),
  temp = require('temp'),
  fs = require('fs');

describe('gm processor', function () {
  before(function () {
    temp.track();
  });
  after(function (done) {
    temp.cleanup(done);
  });

  var imageProcessor = require('../../../../src/processor/image/index'),
    FlamingoOperation = require('../../../../src/util/flamingo-operation');

  it('should work without throwing an error', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      op = new FlamingoOperation();

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

    var process = imageProcessor(op),
      processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      op = new FlamingoOperation();


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

    var process = imageProcessor(op),
      processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  describe('deprecated no-flamingo-operation', function () {
    it('should work without throwing an error', function () {
      var stream = fs.createReadStream('../../../fixtures/images/base64.png');

      var process = imageProcessor([{
          processor: 'gm',
          pipe: function (gm) {
            return gm.gravity('Center');
          }
        }], {
          NATIVE_AUTO_ORIENT: true
        }),
        processedStream = process(stream);

      processedStream.pipe(temp.createWriteStream());

      assert.ok(processedStream);
    });
  });
});
