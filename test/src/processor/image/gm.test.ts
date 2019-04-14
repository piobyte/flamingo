import assert = require('assert');
import temp = require('temp');
import fs = require('fs');
import path = require('path');

import FlamingoOperation = require('../../../../src/model/flamingo-operation');
import gmProcessor = require('../../../../src/processor/image/gm');

describe('gm processor', function() {
  before(() => temp.track());
  after(done => temp.cleanup(done));

  it('should work without throwing an error', function() {
    const stream = fs.createReadStream(
      path.join(__dirname, '../../../fixtures/images/base64.png')
    );
    const op = new FlamingoOperation();

    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const processedStream = gmProcessor(
      op,
      function(pipe) {
        return pipe.gravity('Center');
      },
      stream
    ).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });

  it("should convert to webp without throwing an error (this doesn't mean it can convert to webp)", function() {
    const stream = fs.createReadStream(
      path.join(__dirname, '../../../fixtures/images/base64.png')
    );
    const op = new FlamingoOperation();

    op.config = {
      NATIVE_AUTO_ORIENT: true
    };

    const processedStream = gmProcessor(
      op,
      function(pipe) {
        return pipe.options({ imageMagick: true }).setFormat('webp');
      },
      stream
    ).pipe(temp.createWriteStream());

    assert.ok(processedStream);
  });
});
