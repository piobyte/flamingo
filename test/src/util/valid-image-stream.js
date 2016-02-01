const fs = require('fs');
const assert = require('assert');
const path = require('path');
const validImageStream = require('../../../src/util/valid-image-stream');
const {InvalidInputError} = require('../../../src/util/errors');

describe('valid-image-stream', function () {
  it('resolves for valid input streams', function () {
    const image = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    return validImageStream()(image);
  });
  it('rejects for invalid image streams', function () {
    const image = fs.createReadStream(path.join(__dirname, 'valid-image-stream.js'));
    return validImageStream()(image)
      .catch(e => assert.ok(e instanceof InvalidInputError));
  });
});
