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

  var gmProcessor = require('../../../../src/processor/image/gm');

  it('should work without throwing an error', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      processedStream;

    processedStream = gmProcessor(function (pipe) {
      return pipe.gravity('Center');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      processedStream;

    processedStream = gmProcessor(function (pipe) {
      return pipe.options({imageMagick: true}).setFormat('webp');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
