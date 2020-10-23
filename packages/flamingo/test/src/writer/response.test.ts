// @ts-ignore
import temp = require("temp");
import fs = require("fs");
import path = require("path");
import assert = require("assert");
import sinon = require("sinon");
import Hapi = require("@hapi/hapi");

import responseWriter = require("../../../src/writer/response");
import FlamingoOperation = require("../../../src/model/flamingo-operation");

describe("response writer", function () {
  it("passes the stream to the reply function", function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, "../../fixtures/images/base64.png")
    );
    const replyStream = temp.createWriteStream();

    op.reply = {
      response: function (stream: any) {
        return stream.pipe(replyStream);
      },
    } as Hapi.ResponseToolkit;

    return responseWriter(op)(stream);
  });
  it("applies response headers", async function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, "../../fixtures/images/base64.png")
    );
    const replyStream = temp.createWriteStream();
    const headerSpy = sinon.spy();

    replyStream.header = headerSpy;

    op.reply = {
      response: function (stream: any) {
        return stream.pipe(replyStream);
      },
    } as Hapi.ResponseToolkit;
    op.response = { header: { "x-foo": "bar" } };

    try {
      await responseWriter(op)(stream);
    } finally {
      assert.ok(headerSpy.called);
      assert.ok(headerSpy.calledWithExactly("x-foo", "bar"));
    }
  });

  it.skip("doesn't call reply twice in case of stream error (#10)", async function () {
    const op = new FlamingoOperation();
    const stream = fs.createReadStream(
      path.join(__dirname, "../../fixtures/images/base64.png")
    );
    const replyStream = temp.createWriteStream();
    let replyCalled = 0;

    stream.on("readable", function () {
      stream.emit("error", "stream error");
    });

    op.reply = {
      response: function (stream: any) {
        replyCalled++;
        return stream.pipe(replyStream);
      },
    } as Hapi.ResponseToolkit;
    op.response = {};

    try {
      await responseWriter(op)(stream);
      assert.ok(false);
    } catch {
      assert.strictEqual(replyCalled, 1);
    }
  });
});
