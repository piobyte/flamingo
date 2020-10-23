/**
 * Example profiles
 * @module
 */

import sharp = require("sharp");
// @ts-ignore
import clamp = require("clamp");

import envParser = require("../util/env-parser");
import bestFormat = require("../util/best-format");
import Config = require("../../config");
import Profile from "../types/Profile";
import { ProfileInstruction } from "../types/Instruction";

const MIN_IMAGE_SIZE = 10;
const MAX_IMAGE_SIZE = 1024;

const MIN_QUALITY = 1;
const MAX_QUALITY = 100;

const DEFAULT_AVATAR_SIZE = 170;
const DEFAULT_PREVIEW_IMAGE_SIZE = 200;
const DEFAULT_QUALITY = 80;

const { int, float, objectInt } = envParser;

function extractDimension(
  query: Record<string, any> = {},
  defaultSize: number
) {
  let width;
  let height;

  const hasHeight = typeof query.height === "string";
  const hasWidth = typeof query.width === "string";

  if (hasWidth && !hasHeight) {
    // ?width=300
    width = clamp(
      objectInt("width", defaultSize)(query),
      MIN_IMAGE_SIZE,
      MAX_IMAGE_SIZE
    );
    height = width;
  } else if (hasHeight && !hasWidth) {
    // ?height=300
    height = clamp(
      objectInt("height", defaultSize)(query),
      MIN_IMAGE_SIZE,
      MAX_IMAGE_SIZE
    );
    width = height;
  } else if (hasHeight && hasWidth) {
    // ?height=300&width=300
    width = clamp(
      objectInt("width", defaultSize)(query),
      MIN_IMAGE_SIZE,
      MAX_IMAGE_SIZE
    );
    height = clamp(
      objectInt("height", defaultSize)(query),
      MIN_IMAGE_SIZE,
      MAX_IMAGE_SIZE
    );
  } else {
    // ?
    width = defaultSize;
    height = defaultSize;
  }

  return { width, height };
}

const f: { [name: string]: any } = {};
f["avatar-image"] = 2;

const ExampleProfiles: Record<string, Profile> = {
  /**
   * Avatar image profile
   * @param {Request} request
   * @param {Object} config
   * @return {Promise.<{process: Array}>}
   */
  "avatar-image"(request, config: Config): Promise<ProfileInstruction> {
    let { width, height } = extractDimension(
      request.query,
      DEFAULT_AVATAR_SIZE
    );
    const quality = clamp(
      objectInt("q", DEFAULT_QUALITY)(request.query),
      MIN_QUALITY,
      MAX_QUALITY
    );

    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader: Record<string, any> = config.CLIENT_HINTS
      ? { "Accept-CH": "DPR, Width" }
      : {};

    responseHeader["Content-Type"] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty("dpr")) {
      const dpr = clamp(float(1)(request.headers.dpr), 1, 10);

      responseHeader["Content-DPR"] = dpr;
      responseHeader.Vary = request.headers.hasOwnProperty("width")
        ? "Width"
        : "DPR";

      width =
        responseHeader.Vary === "DPR"
          ? width * dpr
          : clamp(
              int(width)(request.headers.width),
              MIN_IMAGE_SIZE,
              MAX_IMAGE_SIZE
            );
      height = responseHeader.Vary === "DPR" ? height * dpr : width;
    }

    return Promise.resolve({
      name: "avatar-image",
      response: { header: responseHeader },
      process: [
        {
          processor: "sharp",
          pipe(pipe: sharp.Sharp) {
            return pipe
              .rotate()
              .toFormat(format.type, { quality })
              .resize(Math.ceil(width), Math.ceil(height), {
                fit: "outside",
                position: sharp.gravity.center,
              });
          },
        },
      ],
    });
  },

  /**
   * Preview image profile
   * @param {Request} request
   * @param {Object} config
   * @return {Promise.<{process: Array}>}
   */
  "preview-image"(request, config: Config): Promise<ProfileInstruction> {
    let { width, height } = extractDimension(
      request.query,
      DEFAULT_PREVIEW_IMAGE_SIZE
    );
    const quality = clamp(
      objectInt("q", DEFAULT_QUALITY)(request.query),
      MIN_QUALITY,
      MAX_QUALITY
    );

    const format = bestFormat(request.headers.accept, config.DEFAULT_MIME);
    const responseHeader: Record<string, any> = config.CLIENT_HINTS
      ? { "Accept-CH": "DPR, Width" }
      : {};

    responseHeader["Content-Type"] = format.mime;

    if (config.CLIENT_HINTS && request.headers.hasOwnProperty("dpr")) {
      const dpr = clamp(float(1)(request.headers.dpr), 1, 10);

      responseHeader["Content-DPR"] = dpr;
      responseHeader.Vary = request.headers.hasOwnProperty("width")
        ? "Width"
        : "DPR";

      width =
        responseHeader.Vary === "DPR"
          ? width * dpr
          : clamp(
              int(width)(request.headers.width),
              MIN_IMAGE_SIZE,
              MAX_IMAGE_SIZE
            );
      height = responseHeader.Vary === "DPR" ? height * dpr : width;
    }

    return Promise.resolve({
      name: "preview-image",
      response: { header: responseHeader },
      process: [
        {
          processor: "sharp",
          pipe(instance: sharp.Sharp) {
            return instance
              .rotate()
              .flatten({ background: "white" })
              .toFormat(format.type, { quality })
              .resize(Math.ceil(width), Math.ceil(height), {
                fit: "outside",
                position: sharp.gravity.center,
              });
          },
        },
      ],
    });
  },
};

export = ExampleProfiles;
