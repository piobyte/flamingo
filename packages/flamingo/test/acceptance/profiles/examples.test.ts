import assert = require("assert");
import sharp = require("sharp");

import exampleProfiles = require("../../../src/profiles/examples");
import Pipe = require("../../test-util/stub-pipe");

const { buildPipe, stubPipe } = Pipe;

describe("example profiles", function () {
  describe("avatar-image", function () {
    it("uses sharp with defaults", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate"],
        ["toFormat", ["png"]],
        ["resize", [170, 170]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          headers: { accept: "" },
          query: {},
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );

      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });

    it("allows to set the image size via query param", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [200, 200]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { width: "200" },
          headers: { accept: "" },
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );
      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });

    it("allows to set the image width and height via query param", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [200, 300]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { width: "200", height: "300" },
          headers: { accept: "" },
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );
      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });
    it("allows to set the image height and square it", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [300, 300]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { height: "300" },
          headers: { accept: "" },
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );
      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });

    it("uses client hints dpr to scale images", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [400, 400]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "2" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 2,
        "Content-Type": "image/png",
        Vary: "DPR",
      });

      data.process[0].pipe(pipe);
    });

    it("uses Math.ceil on hints dpr width", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [460, 460]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "2.3" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 2.3,
        "Content-Type": "image/png",
        Vary: "DPR",
      });

      data.process[0].pipe(pipe);
    });

    it("uses client hints width to resize images", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png"]],
        ["resize", [600, 600]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "1", width: "600" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 1,
        "Content-Type": "image/png",
        Vary: "Width",
      });

      data.process[0].pipe(pipe);
    });

    it("allows to set quality", async function () {
      const pipe = buildPipe(["rotate", "toFormat", "resize", "min", "crop"]);

      stubPipe(pipe, [
        ["rotate", []],
        ["toFormat", ["png", { quality: 42 }]],
        ["resize", [170, 170]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["avatar-image"](
        {
          headers: { accept: "" },
          query: { q: "42" },
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );
      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });
  });

  describe("preview-image", function () {
    it("uses sane default values", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png"]],
        ["resize", [200]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["preview-image"](
        {
          headers: { accept: "" },
          query: {},
        },
        {
          DEFAULT_MIME: "image/png",
        }
      );
      assert.equal(
        data.process.length,
        1,
        "avatar-image has one processor operation"
      );

      data.process[0].pipe(pipe);
    });
    it("clamps dimension to 10..1024", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png"]],
        ["resize", [1024], [10]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const [lower, upper] = await Promise.all([
        exampleProfiles["preview-image"](
          {
            headers: { accept: "" },
            query: { width: "0" },
          },
          {
            DEFAULT_MIME: "image/png",
          }
        ),
        exampleProfiles["preview-image"](
          {
            headers: { accept: "" },
            query: { width: "2000" },
          },
          {
            DEFAULT_MIME: "image/png",
          }
        ),
      ]);

      lower.process[0].pipe(pipe);
      upper.process[0].pipe(pipe);
    });

    it("uses client hints dpr to scale images", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png"]],
        ["resize", [400]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["preview-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "2" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 2,
        "Content-Type": "image/png",
        Vary: "DPR",
      });

      data.process[0].pipe(pipe);
    });

    it("uses Math.ceil on hints dpr width", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png"]],
        ["resize", [400]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["preview-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "2" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 2,
        "Content-Type": "image/png",
        Vary: "DPR",
      });

      data.process[0].pipe(pipe);
    });

    it("uses client hints width to resize images", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png"]],
        ["resize", [600]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["preview-image"](
        {
          query: { width: "200" },
          headers: { accept: "", dpr: "1", width: "600" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 1,
        "Content-Type": "image/png",
        Vary: "Width",
      });

      data.process[0].pipe(pipe);
    });

    it("allows to set quality", async function () {
      const pipe = buildPipe([
        "rotate",
        "background",
        "flatten",
        "toFormat",
        "resize",
        "min",
        "crop",
      ]);

      stubPipe(pipe, [
        ["rotate", []],
        ["background", ["white"]],
        ["flatten"],
        ["toFormat", ["png", { quality: 50 }]],
        ["resize", [600]],
        ["min", []],
        ["crop", [sharp.gravity.center]],
      ]);

      const data = await exampleProfiles["preview-image"](
        {
          query: { q: "50" },
          headers: { accept: "", dpr: "1", width: "600" },
        },
        {
          CLIENT_HINTS: true,
          DEFAULT_MIME: "image/png",
        }
      );
      assert.deepEqual(data.response.header, {
        "Accept-CH": "DPR, Width",
        "Content-DPR": 1,
        "Content-Type": "image/png",
        Vary: "Width",
      });

      data.process[0].pipe(pipe);
    });
  });
});
