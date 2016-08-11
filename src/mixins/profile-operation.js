'use strict';

const Promise = require('bluebird');
const url = require('url');
const {InvalidInputError} = require('../util/errors');
const {decode} = require('../util/cipher');

module.exports = (SuperClass/*: Convert */) => {
  /**
   * Profile operation mixin
   * @mixin
   */
  class ProfileOperation extends SuperClass {
    /**
     * Resolves a input from a given operation.
     * @param {FlamingoOperation} operation
     * @return {Promise.<Url>} resolves `url.parse(decodedUrlParam)`
     */
    extractInput(operation) {
      const payload = decodeURIComponent(operation.request.params.url);
      const decodePromise = operation.config.CRYPTO.ENABLED ?
        decode(payload, operation.config.CRYPTO.CIPHER, operation.config.CRYPTO.KEY, operation.config.CRYPTO.IV) :
        Promise.resolve(payload);

      return decodePromise.then(decoded => url.parse(decoded));
    }

    /**
     * Extract a profile for a given operation.
     *
     * @param {FlamingoOperation} operation
     * @returns {Promise<{name: string, response: {}, process: Array<{processor: string, pipe: function}>}>}
     */
    extractProcess(operation) {
      const profiles = operation.profiles;
      const profileParam = operation.request.params.profile;

      if (!operation.profiles[profileParam]) {
        return Promise.reject(new InvalidInputError(`Requested unknown profile (${profileParam})`));
      }

      return profiles[profileParam](operation.request, operation.config);
    }
  }

  return ProfileOperation;
};
