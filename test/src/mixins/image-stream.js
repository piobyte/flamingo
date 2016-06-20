const FlamingoOperation = require('../../../src/model/flamingo-operation');
const ImageStream = require('../../../src/mixins/image-stream');
const Convert = require('../../../src/mixins/convert');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');

describe('image-stream', function () {
  it('rejects handling for non image streams', function () {
    const operation = new FlamingoOperation();
    const image = fs.createReadStream(path.join(__dirname, 'image-stream.js'));
    const errorSpy = sinon.spy();

    const ImageStreamClass = class extends ImageStream(Convert(class {})) {
      buildOperation(operation) {
        operation.reader = (operation) => Promise.resolve({
          stream: () => Promise.resolve(image),
          type: 'remote'
        });
        return Promise.resolve(operation);
      }

      handleError(operation){
        return errorSpy;
      }
    };

    const imageStream = new ImageStreamClass();
    const handlePromise = imageStream.handle(operation);
    return handlePromise.finally(() => {
      assert.ok(errorSpy.called);
    });
  });
});
