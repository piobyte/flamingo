import url = require("url");
// @ts-ignore
import temp = require("temp");
import nock = require("nock");
import merge = require("lodash/merge");
import assert = require("assert");

import httpReader = require("../../../src/reader/https");
import FlamingoOperation = require("../../../src/model/flamingo-operation");
import Config = require("../../../config");

const EXAMPLE_ACCESS = {
  HTTPS: { ENABLED: true, READ: [{ hostname: "example.org" }] },
};
const DEFAULT_CONF: Config = {
  READER: {
    REQUEST: {
      TIMEOUT: 10 * 1000,
    },
  },
};

describe("https? reader", function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it("resolves the expected result", function (done) {
    nock("http://example.org/").get("/ok").reply(200, { status: "OK" });

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS,
    });
    op.input = url.parse("http://example.org/ok");

    httpReader(op).then(function (data) {
      assert.ok(!!data.stream);
      const buf: Buffer[] = [];
      const out = temp.createWriteStream();

      data.stream().then(function (stream) {
        stream.on("data", function (e: Buffer) {
          buf.push(e);
        });
        stream.on("end", function () {
          assert.strictEqual(
            Buffer.concat(buf).toString("utf8"),
            '{"status":"OK"}'
          );
          done();
        });
        stream.pipe(out);
      });
    });
  });

  it("rejects for statusCode >= 400", async function () {
    nock("http://example.org/")
      .get("/bad")
      .reply(400, { status: "Bad Request" });

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: EXAMPLE_ACCESS,
    });
    op.input = url.parse("http://example.org/bad");

    const data = await httpReader(op);
    assert.ok(!!data.stream);

    try {
      await data.stream();
      assert.ok(false, "shouldn't resolve this request.");
    } catch {
      assert.ok(true);
    }
  });

  it("sets the url for error requests", async function () {
    nock("http://example.org/")
      .get("/bad")
      .reply(400, { status: "Bad Request" });

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: { HTTPS: { ENABLED: false } },
    });
    op.input = url.parse("http://example.org/bad");

    const data = await httpReader(op);
    assert.ok(!!data.stream);

    try {
      await data.stream();
      assert.ok(false, "shouldn't resolve this request.");
    } catch (reason: any) {
      assert.strictEqual(reason.extra, "http://example.org/bad");
    }
  });

  it("rejects not whitelisted url if access filter is enabled", async function () {
    nock.disableNetConnect();

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: { HTTPS: { ENABLED: true, READ: [] } },
    });
    op.input = url.parse("http://example.org/bad");

    try {
      await httpReader(op);
      assert.ok(false, "shouldn't resolve this request.");
    } catch {
      assert.ok(true);
    }
  });
  it("resolves not whitelisted url if access filter is disabled", function () {
    nock.disableNetConnect();

    const op = new FlamingoOperation();
    op.config = merge({}, DEFAULT_CONF, {
      ACCESS: { HTTPS: { ENABLED: false, READ: [] } },
    });
    op.input = url.parse("http://example.org/");

    return httpReader(op);
  });
});
