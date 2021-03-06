import S3Mixin = require("./mixin");
import Image = require("flamingo/src/routes/image");
import FlamingoOperation = require("flamingo/src/model/flamingo-operation");
import Server = require("flamingo/src/model/server");
import Config = require("flamingo/config");
import Hapi = require("@hapi/hapi");

/**
 * Flamingo Image route
 * @external Image
 * @see {@link https://piobyte.github.io/flamingo/Image.html|Image}
 */

/**
 * Route that converts an image, stored on aws s3
 * @class
 * @mixes S3
 * @extends external:Image
 */
class S3Route extends S3Mixin(Image) {
  constructor(
    conf: Config,
    method: Hapi.Util.HTTP_METHODS_PARTIAL = "GET",
    path = "/s3/{bucketAlias}/{profile}/{key}",
    description = "Profile conversion based on aws s3 input"
  ) {
    super(conf, method, path, description);
  }
}

export = S3Route;
