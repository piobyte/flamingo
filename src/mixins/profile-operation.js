'use strict';

const readerForUrl = require('../util/reader-for-url');
const Promise = require('bluebird');
const url = require('url');
const responseWriter = require('../writer/response');
const errors = require('../util/errors');

module.exports = (SuperClass) => {
  class ProfileOperation extends SuperClass {
    /**
     * Function that extracts a profile for a given operation.
     *
     * @param operation
     * @returns Promise
     */
    extractProfile(operation) {
      const profiles = operation.profiles;
      const profileParam = operation.request.params.profile;

      if (!operation.profiles[profileParam]) {
        return Promise.reject(new errors.InvalidInputError('Unknown profile'));
      }

      return profiles[profileParam](operation.request, operation.config);
    }

    inputUrl(op) {
      return op.config.DECODE_PAYLOAD(decodeURIComponent(op.request.params.url));
    }

    buildOperation(operation) {
      return Promise.all([
        this.inputUrl(operation),
        this.extractProfile(operation)
      ]).then(function ([urlParam, profile]) {
        const parsedUrl = url.parse(urlParam);
        const reader = readerForUrl(parsedUrl);

        if (!reader) {
          return Promise.reject(new errors.InvalidInputError('No reader available for given url'));
        }

        operation.profile = profile;
        operation.reader = reader;
        operation.targetUrl = parsedUrl;
        operation.writer = responseWriter;

        return operation;
      });
    }
  }

  return ProfileOperation;
};
