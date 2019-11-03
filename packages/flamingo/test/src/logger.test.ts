import temp = require("temp");
import fs = require("fs");
import assert = require("assert");
import assign = require("lodash/assign");
import url = require("url");
import util = require("util");

import FlamingoOperation = require("../../src/model/flamingo-operation");
import Route = require("../../src/model/route");
import logger = require("../../src/logger");

const readFile = util.promisify(fs.readFile);

describe("logger", function() {
  it("checks that the method calls the stream function", async function() {
    const tempPath = temp.path({ suffix: ".log" });
    const loggerName = "test:logger.addStreams";
    const LOG_MESSAGE = "Time is an illusion. Lunchtime doubly so.";

    logger.addStreams([
      {
        name: "temp",
        level: "fatal",
        path: tempPath
      }
    ]);

    const log = logger.build(loggerName);
    log.fatal(LOG_MESSAGE);

    const data = await readFile(tempPath);
    assert.equal(JSON.parse(data.toString("utf8")).msg, LOG_MESSAGE);
  });

  it("serializes request log objects", function() {
    const REQUEST = {
      headers: "headers",
      path: "/foo",
      method: "get"
    };
    const serialized = logger.serializers.request(
      assign({}, REQUEST, {
        SOME_WEIRD_EXTRA_FIELD: "bar"
      })
    );

    assert.deepEqual(serialized, REQUEST);
    assert.ok(
      logger.serializers.request("foo"),
      "it doesn't break on invalid input"
    );
  });

  it("serializes routes", function() {
    const route = new Route({}, "POST", "/post-me", "some post route");
    const serialized = logger.serializers.route(route);

    assert.deepEqual(serialized, {
      description: "some post route",
      method: "POST",
      name: "Route",
      path: "/post-me"
    });
    assert.ok(
      logger.serializers.route(42),
      "it doesn't break on invalid input"
    );
  });

  it("serializes request error objects", function() {
    /* eslint no-underscore-dangle: 0 */
    let err;
    try {
      JSON.parse("foo");
    } catch (e) {
      err = e;
    }

    // check if the serialized object has the stack property
    assert.ok(logger.serializers.error(err).hasOwnProperty("stack"));
    assert.ok(
      logger.serializers.error(2)._serializerError.length > 0,
      "won't break on non error objects"
    );
    assert.ok(
      logger.serializers.error(NaN)._serializerError.length > 0,
      "won't break on non error objects"
    );
  });

  it("serializes request error strings", function() {
    /* eslint no-underscore-dangle: 0 */

    assert.deepEqual(logger.serializers.error("pls halp"), {
      message: "pls halp"
    });
  });

  it("serializes input", function() {
    assert.deepEqual(
      logger.serializers.input("# Headline\nsome markdown"),
      "# Headline\nsome markdown"
    );
    assert.deepEqual(
      logger.serializers.input(url.parse("http://zombo.com/")),
      url.format(url.parse("http://zombo.com"))
    );
    assert.deepEqual(
      logger.serializers.input({ some: "object" }),
      "{ some: 'object' }"
    );
  });

  it("serializes operation object", function() {
    const operation = new FlamingoOperation();
    operation.input = url.parse(
      "https://travis-ci.org/piobyte/flamingo.svg?branch=master"
    );
    operation.request = {
      headers: { "user-agent": "flamingo/2.0.0" },
      path: "/video/example-profile/12345",
      method: "get"
    };

    assert.deepEqual(logger.serializers.operation(operation), {
      input: "https://travis-ci.org/piobyte/flamingo.svg?branch=master",
      request: {
        headers: { "user-agent": "flamingo/2.0.0" },
        path: "/video/example-profile/12345",
        method: "get"
      }
    });
  });
});
