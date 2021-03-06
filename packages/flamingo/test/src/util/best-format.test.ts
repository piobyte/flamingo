import assert = require("assert");
import bestFormat = require("../../../src/util/best-format");

describe("best-format", function () {
  it("should return webp if accept requests it", function () {
    // default webkit accept header
    assert.deepStrictEqual(bestFormat("image/webp,*/*;q=0.8", "image/png"), {
      mime: "image/webp",
      type: "webp",
    });
  });

  it("should return first matching mime if accept requests it", function () {
    assert.deepStrictEqual(
      bestFormat(
        "image/jpeg,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
        "image/png"
      ),
      {
        mime: "image/jpeg",
        type: "jpeg",
      }
    );
    // default MS accept header
    assert.deepStrictEqual(
      bestFormat("image/png,image/*;q=0.8,*/*;q=0.5", "image/png"),
      { mime: "image/png", type: "png" }
    );
    assert.deepStrictEqual(
      bestFormat("image/jpeg,image/png,*/*;q=0.5", "image/png"),
      { mime: "image/jpeg", type: "jpeg" }
    );
  });

  it("should use default mime if wildcard accept header exists", function () {
    assert.deepStrictEqual(bestFormat("*/*;q=0.8", "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat("*/*", "image/png"), {
      mime: "image/png",
      type: "png",
    });
  });

  it("should work with non image accept headers", function () {
    assert.deepStrictEqual(
      bestFormat(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "image/png"
      ),
      {
        mime: "image/png",
        type: "png",
      }
    );
    assert.deepStrictEqual(bestFormat("text/html", "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat("image/*", "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat("wasd", "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat("image,png", "image/png"), {
      mime: "image/png",
      type: "png",
    });
  });

  it("should use default mime if no accept header exists", function () {
    assert.deepStrictEqual(bestFormat("", "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat(undefined, "image/png"), {
      mime: "image/png",
      type: "png",
    });
    assert.deepStrictEqual(bestFormat(null, "image/png"), {
      mime: "image/png",
      type: "png",
    });
  });
});
