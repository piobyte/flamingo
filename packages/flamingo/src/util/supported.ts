/**
 * Supported features module
 * @module
 */
import path = require("path");
// @ts-ignore
import temp = require("temp");
// @ts-ignore
import ffmpeg = require("fluent-ffmpeg");

import Config = require("../../config");
import { SupportedConfig } from "../types/SupportedConfig";

/**
 * Function to check if ffmpeg/ffprobe is installed and usable
 * @returns {Promise} resolves true or false depending on the ffmpeg/ffprobe support
 */
function hasFFmpeg() {
  return new Promise((resolve) =>
    ffmpeg.ffprobe(
      path.join(__dirname, "../../test/fixtures/videos/trailer_1080p.ogg"),
      (err: Error) => resolve(!err)
    )
  );
}

/**
 * Function to check if defined features are supported.
 * @return {Promise} promise that resolves with an object that contains supported feature flags
 * @example
 * supported()
 *   .then((supported) =>
 *     console.log(supported.GM.WEBP ? 'webp is supported for gm processor' : 'webp not supported for gm processor'))
 */
export = function (conf?: Config): Promise<SupportedConfig> {
  const supported: SupportedConfig = { FFMPEG: false, GM: { WEBP: false } };
  temp.track();

  return Promise.all([hasFFmpeg()]).then(function ([FFMPEG]) {
    /*eslint no-sync: 0*/
    temp.cleanupSync();

    supported.FFMPEG = !!FFMPEG;

    return supported;
  });
};
