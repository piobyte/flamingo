var assert = require('assert'),
  temp = require('temp'),
  fs = require('fs');

describe('sharp processor', function () {
  before(function () {
    temp.track();
  });
  after(function (done) {
    temp.cleanup(done);
  });

  var sharpProcessor = require('../../../../src/processor/image/sharp');

  it('should work without throwing an error', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      processedStream;

    processedStream = sharpProcessor(function (pipe) {
      return pipe.rotate();
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    var stream = fs.createReadStream('../../../fixtures/images/base64.png'),
      processedStream;

    processedStream = sharpProcessor(function (pipe) {
      return pipe.toFormat('webp');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
