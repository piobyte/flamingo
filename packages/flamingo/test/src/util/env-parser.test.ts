import assert = require("assert");
import envParser = require("../../../src/util/env-parser");

const { int, objectInt, buffer64, buffer, boolean, float } = envParser;

const compareFunction = function (bufA, bufB) {
  return bufA.compare(bufB) === 0;
};

describe("env-parser", function () {
  describe("#objectInt()", function () {
    it("converts an object field to an integer number", function () {
      assert.strictEqual(objectInt("width", 200)({ width: 100 }), 100);
    });
    it("returns default for bad inputs", function () {
      assert.strictEqual(objectInt("width", 200)({ height: 100 }), 200);
      assert.strictEqual(objectInt("width", 200)({}), 200);
      assert.strictEqual(objectInt("width", 200)(null), 200);
      assert.strictEqual(objectInt("width", 200)(""), 200);
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
      assert.strictEqual(int(42)("9000"), 9000);
      assert.strictEqual(int(42)("0"), 0);
      assert.strictEqual(int(42)("-9000"), -9000);
    });
    it("returns default for bad inputs", function () {
      assert.strictEqual(int(42)(), 42);
      assert.strictEqual(int(42)(null), 42);
      assert.strictEqual(int(42)("foo"), 42);
      assert.strictEqual(int(42)(false), 42);
    });
  });

  describe("#boolean()", function () {
    it("converts a boolean string to a boolean", function () {
      assert.strictEqual(boolean("true"), true);
      assert.strictEqual(boolean("false"), false);
    });
    it("returns false for bad inputs", function () {
      assert.strictEqual(boolean("false"), false);
      assert.strictEqual(boolean(true), false);
      assert.strictEqual(boolean(), false);
      assert.strictEqual(boolean("wasd"), false);
      assert.strictEqual(boolean("123"), false);
    });
  });

  describe("#float()", function () {
    it("converts a float string to a float number", function () {
      assert.strictEqual(float(0)("3.14"), 3.14);
      assert.strictEqual(float(0)("0.33"), 0.33);
      assert.strictEqual(float(0)("-42.1"), -42.1);
    });
    it("returns default for bad inputs", function () {
      assert.strictEqual(float(1)("foo"), 1);
      assert.strictEqual(float(1)(), 1);
      assert.strictEqual(float(1)(false), 1);
      assert.strictEqual(float(1)(null), 1);
    });
  });
});
