const FlamingoOperation = require('../../../src/model/flamingo-operation');
var ImageStream = require('../../../src/mixins/image-stream');

describe('logger', function () {
  it.skip('checks that the method calls the stream function', function () {
    // TODO
    const ImageStreamClass = ImageStream(class {});

    const imageStream = new ImageStreamClass();
    const operation = new FlamingoOperation();

    imageStream.validStream(operation);
  });
});
