import videoPreprocessor = require("../preprocessor/video/index");
import Route = require("../model/route");
import Constructor from "../model/Constructor";
import Server = require("../model/server");
import FlamingoOperation = require("../model/flamingo-operation");
import Config = require("../../config");
import { ReaderResult } from "../types/ReaderResult";
import nodeStream = require("stream");

export = function <T extends Constructor<Route>>(Base: T) {
  /**
   * Mixin that adds a video preprocessor which creates an image from a given video
   * @mixin
   */
  return class VideoPreprocess extends Base {
    /**
     * Adds video preprocessor
     * @param operation
     * @see module:flamingo/src/preprocessor/video
     */
    preprocess(
      operation: FlamingoOperation
    ): (result: ReaderResult) => Promise<nodeStream.Readable> {
      return videoPreprocessor(operation);
    }
  };
};
