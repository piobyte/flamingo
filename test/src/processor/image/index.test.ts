import assert = require('assert');
import temp = require('temp');
import fs = require('fs');
import path = require('path');

import imageProcessor = require('../../../../src/processor/image/index');
import FlamingoOperation = require('../../../../src/model/flamingo-operation');

describe('gm processor', function() {
  before(() => temp.track());
  after(done => temp.cleanup(done));

  it('should work without throwing an error', function() {
    const stream = fs.createReadStream(
      path.join(__dirname, '../../../fixtures/images/base64.png')
    );
    const op = new FlamingoOperation();

    op.process = [
      {
        processor: 'gm',
        pipe(gm) {
          return gm.gravity('Center');
        }
      }
    ];
    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const process = imageProcessor(op);
    const processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it("should convert to webp without throwing an error (this doesn't mean it can convert to webp)", function() {
    const stream = fs.createReadStream(
      path.join(__dirname, '../../../fixtures/images/base64.png')
    );
    const op = new FlamingoOperation();

    op.process = [
      {
        processor: 'gm',
        pipe(gm) {
          return gm.gravity('Center');
        }
      }
    ];
    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const process = imageProcessor(op);
    const processedStream = process(stream);

    processedStream.pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
