/**
 * Debug profiles that choose a processor based on the `processor` query param
 * @module
 */
import sharp = require("sharp");
import clamp = require("clamp");

import bestFormat = require("../util/best-format");
import envParser = require("../util/env-parser");
import { ProcessInstruction } from "../types/Instruction";

export = {
  /**
   * Same as example preview image profile, with additional option to set processor with the `processor` query param.
   * @param {Request} request
   * @param {Object} config
   * @see module:flamingo/src/profiles/examples
   * @return {Promise.<{process: Array}>}
   */
  "debug-preview-image"(request, config) {
    const dim = clamp(
      envParser.objectInt("width", 200)(request.query),
      10,
      1024
    );
    const process: ProcessInstruction<sharp.Sharp | any>[] = [];
    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === "gm") {
      process.push({
        processor: "gm",
        pipe(pipe) {
          // if (format.type === 'webp') {
          pipe = pipe.options({ imageMagick: true });
          // }

          return pipe
            .autoOrient()
            .setFormat(format.type)
            .resize(dim, dim + "^")
            .background("white")
            .flatten()
            .gravity("Center")
            .extent(dim, dim);
        }
      });
    } else {
      process.push({
        processor: "sharp",
        pipe(pipe: sharp.Sharp) {
          return pipe
            .rotate()
            .flatten({ background: "white" })
            .toFormat(format.type)
            .resize(dim, dim, {
              fit: "outside",
              position: sharp.gravity.center
            });
        }
      });
    }

    return Promise.resolve({ process });
  },
  /**
   * Same as examples avatar-image profile, with additional option to set processor with the `processor` query param.
   * @param request
   * @param config
   * @see module:flamingo/src/profiles/examples
   * @return {Promise.<{process: Array}>}
   */
  "debug-avatar-image"(request, config) {
    const dim = clamp(
      envParser.objectInt("width", 200)(request.query),
      10,
      1024
    );
    const process: ProcessInstruction<sharp.Sharp | any>[] = [];
    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);

    if (request.query.processor === "gm") {
      process.push({
        processor: "gm",
        pipe(pipe) {
          if (format.type === "webp") {
            pipe = pipe.options({ imageMagick: true });
          }
          return pipe
            .autoOrient()
            .setFormat(format.type)
            .resize(dim, dim + "^")
            .background("transparent")
            .gravity("Center")
            .extent(dim, dim);
        }
      });
    } else {
      process.push({
        processor: "sharp",
        pipe(pipe: sharp.Sharp) {
          return pipe
            .rotate()
            .toFormat(format.type)
            .resize(dim, dim, {
              fit: "outside",
              position: sharp.gravity.center
            });
        }
      });
    }

    return Promise.resolve({ process });
  }
};
