const assert = require('assert');
const temp = require('temp');
const fs = require('fs');

describe('sharp processor', function () {
  before(() => temp.track());
  after((done) => temp.cleanup(done));

  const sharpProcessor = require('../../../../src/processor/image/sharp');
  const FlamingoOperation = require('../../../../src/model/flamingo-operation');

  it('should work without throwing an error', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    let processedStream;
    const op = new FlamingoOperation();

    processedStream = sharpProcessor(op, function (pipe) {
      return pipe.rotate();
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it('should convert to webp without throwing an error (this doesn\'t mean it can convert to webp)', function () {
    const stream = fs.createReadStream('../../../fixtures/images/base64.png');
    let processedStream;
    const op = new FlamingoOperation();

    processedStream = sharpProcessor(op, function (pipe) {
      return pipe.toFormat('webp');
    }, stream).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
