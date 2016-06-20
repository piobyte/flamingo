'use strict';

const readerForUrl = require('../util/reader-for-url');
const Promise = require('bluebird');
const url = require('url');
const responseWriter = require('../writer/response');
const {InvalidInputError} = require('../util/errors');

module.exports = (SuperClass) => {
  class ProfileOperation extends SuperClass {
    /**
     * Extract a profile for a given operation.
     *
     * @param operation
     * @returns Promise
     */
    extractProfile(operation) {
      const profiles = operation.profiles;
      const profileParam = operation.request.params.profile;

      if (!operation.profiles[profileParam]) {
        return Promise.reject(new InvalidInputError('Unknown profile'));
      }

      return profiles[profileParam](operation.request, operation.config);
    }

    /**
     * Resolves a input from a given operation.
     * @param operation
     * @return {Promise.<{}>} resolves `url.parse(decoded)` result
       */
    extractInput(operation) {
      return operation.config.DECODE_PAYLOAD(decodeURIComponent(operation.request.params.url))
        .then(decoded => url.parse(decoded));
    }

    /**
     * Resolves a reader function for a given input. Rejects with InvalidInputError if no reader is found.
     * @param input
     * @return {Promise.<function>} reader
       */
    extractReader(input) {
      const reader = readerForUrl(input);

      if (!reader) {
        return Promise.reject(new InvalidInputError(`No reader available for given url (${input})`));
      }

      return Promise.resolve(reader);
    }

    buildOperation(operation) {
      return Promise.all([
        this.extractInput(operation),
        this.extractProfile(operation)
      ]).then(([input, profile]) =>
        this.extractReader(input).then(reader => {
          operation.input = input;
          operation.profile = profile;
          operation.reader = reader;
          operation.writer = responseWriter;

          return operation;
        }));
    }
  }

  return ProfileOperation;
};
