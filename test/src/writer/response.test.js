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

  it('doesn\'t call reply twice in case of stream error (#10)', function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    const replyStream = temp.createWriteStream();
    let replyCalled = 0;

    stream.on('readable', function(){
      stream.emit('error', 'stream error');
    });

    op.reply = function (stream) {
      replyCalled++;
      return stream.pipe(replyStream);
    };
    op.response = {};

    return responseWriter(op)(stream).then(
      () => assert.ok(false),
      () => assert.equal(replyCalled, 1)
    );
  });
});
