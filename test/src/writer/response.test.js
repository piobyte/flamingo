const temp = require('temp');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const sinon = require('sinon');

const responseWriter = require('../../../src/writer/response');
const FlamingoOperation = require('../../../src/model/flamingo-operation');

describe('response writer', function () {
  it('passes the stream to the reply function', function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    const replyStream = temp.createWriteStream();

    op.reply = function (stream) {
      return stream.pipe(replyStream);
    };

    return responseWriter(op)(stream);
  });
  it('applies response headers', function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    const replyStream = temp.createWriteStream();
    const headerSpy = sinon.spy();

    replyStream.header = headerSpy;

    op.reply = function (stream) {
      return stream.pipe(replyStream);
    };
    op.response = {header: {'x-foo': 'bar'}};

    return responseWriter(op)(stream).finally(() => {
      assert.ok(headerSpy.called);
      assert.ok(headerSpy.calledWithExactly('x-foo', 'bar'));
    });
  });
});
