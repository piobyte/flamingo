import assert = require("assert");
import envParser = require("../../../src/util/env-parser");

const { int, objectInt, buffer64, buffer, boolean, float } = envParser;

const compareFunction = function (bufA, bufB) {
  return bufA.compare(bufB) === 0;
};

describe("env-parser", function () {
  describe("#objectInt()", function () {
    it("converts an object field to an integer number", function () {
      assert.equal(objectInt("width", 200)({ width: 100 }), 100);
    });
    it("returns default for bad inputs", function () {
      assert.equal(objectInt("width", 200)({ height: 100 }), 200);
      assert.equal(objectInt("width", 200)({}), 200);
      assert.equal(objectInt("width", 200)(null), 200);
      assert.equal(objectInt("width", 200)(""), 200);
    });
  });

  describe("#buffer64()", function () {
    it("wraps the input in a base64 buffer", function () {
      assert.ok(
        compareFunction(
          Buffer.from("DjiZ7AWTeNh38zoQiZ76gw==", "base64"),
          buffer64("DjiZ7AWTeNh38zoQiZ76gw==")
        )
      );
    });
  });

  describe("#buffer()", function () {
    it("wraps the input in a buffer", function () {
      assert.ok(compareFunction(Buffer.from("wasd"), buffer("wasd")));
    });
  });

  describe("#int()", function () {
    it("converts a boolean string to an integer number", function () {
      assert.equal(int(42)("9000"), 9000);
      assert.equal(int(42)("0"), 0);
      assert.equal(int(42)("-9000"), -9000);
    });
    it("returns default for bad inputs", function () {
      assert.equal(int(42)(), 42);
      assert.equal(int(42)(null), 42);
      assert.equal(int(42)("foo"), 42);
      assert.equal(int(42)(false), 42);
    });
  });

  describe("#boolean()", function () {
    it("converts a boolean string to a boolean", function () {
      assert.equal(boolean("true"), true);
      assert.equal(boolean("false"), false);
    });
    it("returns false for bad inputs", function () {
      assert.equal(boolean("false"), false);
      assert.equal(boolean(true), false);
      assert.equal(boolean(), false);
      assert.equal(boolean("wasd"), false);
      assert.equal(boolean("123"), false);
    });
  });

  describe("#float()", function () {
    it("converts a float string to a float number", function () {
      assert.equal(float(0)("3.14"), 3.14);
      assert.equal(float(0)("0.33"), 0.33);
      assert.equal(float(0)("-42.1"), -42.1);
    });
    it("returns default for bad inputs", function () {
      assert.equal(float(1)("foo"), 1);
      assert.equal(float(1)(), 1);
      assert.equal(float(1)(false), 1);
      assert.equal(float(1)(null), 1);
    });
  });
});
