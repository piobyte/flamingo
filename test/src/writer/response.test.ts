import temp = require('temp');
import fs = require('fs');
import path = require('path');
import assert = require('assert');
import sinon = require('sinon');

import responseWriter = require('../../../src/writer/response');
import FlamingoOperation = require('../../../src/model/flamingo-operation');
import { Reply } from '../../../src/types/HTTP';

describe('response writer', function() {
  it('passes the stream to the reply function', function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();

    op.reply = ({
      headers() {
        return {
          send(stream) {
            return stream.pipe(replyStream);
          }
        };
      }
    } as any) as Reply;

    return responseWriter(op)(stream);
  });
  it('applies response headers', async function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();
    const headerSpy = sinon.spy();

    op.reply = ({
      headers(headers) {
        headerSpy(headers);
        return {
          send(stream) {
            return stream.pipe(replyStream);
          }
        };
      }
    } as any) as Reply;
    op.response = { header: { 'x-foo': 'bar' } };

    try {
      await responseWriter(op)(stream);
    } finally {
      assert.ok(headerSpy.called);
      assert.ok(headerSpy.calledWithExactly({ 'x-foo': 'bar' }));
    }
  });

  it.skip("doesn't call reply twice in case of stream error (#10)", async function() {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const replyStream = temp.createWriteStream();
    let replyCalled = 0;

    stream.on('readable', function() {
      stream.emit('error', 'stream error');
    });

    op.reply = ({
      headers() {
        return {
          send(stream) {
            replyCalled++;
            return stream.pipe(replyStream);
          }
        };
      }
    } as any) as Reply;
    op.response = {};

    try {
      await responseWriter(op)(stream);
      assert.ok(false);
    } catch {
      assert.equal(replyCalled, 1);
    }
  });
});
