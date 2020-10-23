import assert = require("assert");
// @ts-ignore
import temp = require("temp");
import path = require("path");

import ReaderType = require("../../../../src/model/reader-type");
import videoProcessor = require("../../../../src/preprocessor/video/index");
import FlamingoOperation = require("../../../../src/model/flamingo-operation");

describe("video preprocessor", function () {
  before(() => temp.track());
  after((done) => temp.cleanup(done));

  it("should work without throwing an error", async function () {
    const op = new FlamingoOperation();
    const VIDEO_FILE = path.join(
      __dirname,
      "../../../fixtures/videos/trailer_1080p.ogg"
    );
    const readResult = {
      stream() {
        throw new Error("shouldn't call the stream function on a file");
      },
      path: VIDEO_FILE,
      type: ReaderType.FILE,
    };

    op.preprocessorConfig = {
      seekPercent: 0.1,
    };
    op.config = {
      PREPROCESSOR: {
        VIDEO: {
          KILL_TIMEOUT: 10 * 1000,
        },
      },
    };

    const stream = await videoProcessor(op)(readResult);
    assert.strictEqual(typeof stream.pipe, "function");
  });
});
