'use strict';

const readerForUrl = require('../util/reader-for-url');
const Promise = require('bluebird');
const url = require('url');
const responseWriter = require('../writer/response');
const {InvalidInputError} = require('../util/errors');

module.exports = (SuperClass) => {
  /**
   * Profile operation mixin
   * @mixin
   */
  class ProfileOperation extends SuperClass {
    /**
     * Extract a profile for a given operation.
     *
     * @param {FlamingoOperation} operation
     * @returns {Promise<{name: string, response: {}, process: Array<{processor: string, pipe: function}>}>}
     */
    extractProfile(operation) {
      const profiles = operation.profiles;
      const profileParam = operation.request.params.profile;

      if (!operation.profiles[profileParam]) {
        return Promise.reject(new InvalidInputError(`Requested unknown profile (${profileParam})`));
      }

      return profiles[profileParam](operation.request, operation.config);
    }

    /**
     * Resolves a input from a given operation.
     * @param {FlamingoOperation} operation
     * @return {Promise.<Url>} resolves `url.parse(decodedUrlParam)`
     */
    extractInput(operation) {
      return operation.config.DECODE_PAYLOAD(decodeURIComponent(operation.request.params.url))
        .then(decoded => url.parse(decoded));
    }

    /**
     * Resolves a reader function for a given input. Rejects with InvalidInputError if no reader is found.
     * @param input
     * @return {Promise.<function>} reader
     * @example
     * (input) =>
     *   Promise.resolve((operation) => ({stream: fs.createReadStream('path/to/image.png'), type: 'file'}))
     */
    extractReader(input) {
      const reader = readerForUrl(input);

      if (!reader) {
        return Promise.reject(new InvalidInputError('No reader available for given input', input));
      }

      return Promise.resolve(reader);
    }

    /**
     * Builds a flamingo operation by extracting input, profile and reader from the given operation
     * @return {Promise.<FlamingoOperation>}
     * @param {Request} request
     * @param {function} reply
     */
    buildOperation(request, reply) {
      return super.buildOperation(request, reply).then(operation =>
        Promise.all([
          this.extractInput(operation),
          this.extractProfile(operation)
        ]).then(([input, profile]) =>
          this.extractReader(input).then(reader => {
            operation.input = input;
            operation.profile = profile;
            operation.reader = reader;
            operation.writer = responseWriter;

            return operation;
          })));
    }
  }

  return ProfileOperation;
};
