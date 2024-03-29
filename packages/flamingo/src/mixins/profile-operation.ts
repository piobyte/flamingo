import url = require("url");

import Route = require("../model/route");
import errors = require("../util/errors");
import cipher = require("../util/cipher");
import FlamingoOperation = require("../model/flamingo-operation");
import Constructor from "../model/Constructor";
import Server = require("../model/server");
import Config = require("../../config");

const { InvalidInputError } = errors;
const { decode } = cipher;

export = function <T extends Constructor<Route>>(Base: T) {
  /**
   * Mixin that extracts the process instruction by looking them up in a profile which name is encoded in the url.
   * @mixin
   */
  return class ProfileOperation extends Base {
    /**
     * Resolves a input from a given operation.
     * @param {FlamingoOperation} operation
     * @return {Promise.<Url>} resolves `url.parse(decodedUrlParam)`
     */
    extractInput(operation: FlamingoOperation) {
      const payload = decodeURIComponent(operation.request.params.url);
      const { CRYPTO } = operation.config;

      const decodePromise = CRYPTO?.ENABLED
        ? decode(payload, CRYPTO!.CIPHER, CRYPTO!.KEY, CRYPTO!.IV)
        : Promise.resolve(payload);

      return decodePromise.then((decoded) => url.parse(decoded));
    }

    /**
     * Extract a profile for a given operation.
     *
     * @param {FlamingoOperation} operation
     * @returns {Promise<{name: string, response: {}, process: Array<{processor: string, pipe: function}>}>}
     */
    extractProcess(operation: FlamingoOperation) {
      const profiles = this.server.profiles;
      const profileParam = operation.request.params.profile;

      if (!profiles[profileParam]) {
        return Promise.reject(
          new InvalidInputError(`Requested unknown profile (${profileParam})`)
        );
      }

      return profiles[profileParam](operation.request, operation.config);
    }
  };
};
