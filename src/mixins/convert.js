'use strict';

const Promise = require('bluebird');
const logger = require('../logger').build('route.convert');
const errorReply = require('../util/error-reply');
const imageProcessor = require('../processor/image');
const unfoldReaderResult = require('../util/unfold-reader-result');

module.exports = (SuperClass/*:Route*/) => {
  class Convert extends SuperClass {
    buildOperation(operation) {
      return Promise.resolve(operation);
    }

    validOperation(operation) {
      return Promise.resolve(operation);
    }

    read(operation) {
      return (op) => op.reader(op);
    }

    preprocess(operation) {
      // same as return (readerResult) => unfoldReaderResult(readerResult);
      return unfoldReaderResult;
    }

    validStream(operation) {
      return (stream) => Promise.resolve(stream);
    }

    process(operation) {
      // same as return (stream) => transform(stream);
      return imageProcessor(operation);
    }

    write(operation) {
      // same as return (stream) => operation.response.write(stream);
      return operation.writer(operation);
    }

    handle(operation) {
      this.buildOperation(operation).then(buildOperation =>
        this.validOperation(buildOperation)
          .then(this.read(buildOperation))
          .then(this.preprocess(buildOperation))
          .then(this.validStream(buildOperation))
          .then(this.process(buildOperation))
          .then(this.write(buildOperation)))
        .catch((err) => {
          logger.error({
            error: err,
            // request: operation.request,
            operation: operation
          }, 'Convert error for ' + operation.request.path);
          errorReply(operation, err);
        });
    }
  }

  return Convert;
};
