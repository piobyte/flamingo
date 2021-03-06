import VideoPreprocess = require("./../mixins/video-preprocess");
import Image = require("./image");
import Server = require("../model/server");
import FlamingoOperation = require("../model/flamingo-operation");
import Config = require("../../config");
import Hapi = require("@hapi/hapi");

/**
 * Route that converts a video to an image.
 * The video location is extracted from a request param
 * @class
 * @extends Route
 * @mixes VideoPreprocess
 */
class Video extends VideoPreprocess(Image) {
  /**
   *
   * @param {Config} conf
   * @param {string} [method='GET']
   * @param {string} [path='/video/{profile}/{url}']
   * @param {string} [description='Profile video conversion']
   */
  constructor(
    conf: Config,
    method: Hapi.Util.HTTP_METHODS_PARTIAL = "GET",
    path = "/video/{profile}/{url}",
    description = "Profile video conversion"
  ) {
    super(conf, method, path, description);
  }
}

export = Video;
