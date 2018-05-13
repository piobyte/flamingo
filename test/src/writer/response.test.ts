import temp = require('temp');
import fs = require('fs');
import path = require('path');
import assert = require('assert');
import sinon = require('sinon');

import responseWriter = require('../../../src/writer/response');
import FlamingoOperation = require('../../../src/model/flamingo-operation');

describe('response writer', function() {
  it('passes the stream to the reply function', function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();

    op.reply = function(stream) {
      return stream.pipe(replyStream);
    };

    return responseWriter(op)(stream);
  });
  it('applies response headers', async function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();
    const headerSpy = sinon.spy();

    replyStream.header = headerSpy;

    op.reply = function(stream) {
      return stream.pipe(replyStream);
    };
    op.response = { header: { 'x-foo': 'bar' } };

    try {
      await responseWriter(op)(stream);
    } finally {
      assert.ok(headerSpy.called);
      assert.ok(headerSpy.calledWithExactly('x-foo', 'bar'));
    }
  });

  it("doesn't call reply twice in case of stream error (#10)", async function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();
    let replyCalled = 0;

    stream.on('readable', function() {
      stream.emit('error', 'stream error');
    });

    op.reply = function(stream) {
      replyCalled++;
      return stream.pipe(replyStream);
    };
    op.response = {};

    try {
      await responseWriter(op)(stream);
      assert.ok(false);
    } catch {
      assert.equal(replyCalled, 1);
    }
  });
});
