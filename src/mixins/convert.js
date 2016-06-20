'use strict';

const Promise = require('bluebird');
const logger = require('../logger').build('route.convert');
const errorReply = require('../util/error-reply');
const imageProcessor = require('../processor/image');
const unfoldReaderResult = require('../util/unfold-reader-result');

module.exports = (SuperClass/*:Route*/) => {
  /**
   * Basic mixin that represents the flamingo conversation process.
   * @class
   */
  class Convert extends SuperClass {
    /**
     * Resolves with the configured FlamingoOperation
     * @param {FlamingoOperation} operation
     * @returns {Promise.<FlamingoOperation>} resolves with the configured FlamingoOperation
     * @example
     * // do nothing to the operation, simply pass it on
     * buildOperation(operation) => {
     *  operation.reply = customReply(operation);
     *  return Promise.resolve(operation);
     * }
     */
    buildOperation(operation) {
      return Promise.resolve(operation);
    }

    /**
     * Resolves if the given operation is valid
     * @param operation
     * @returns {Promise.<FlamingoOperation>}
     * @example
     * validOperation(operation) => operation.input.protocol ?
     *    Promise.resolve(operation) :
     *    Promise.reject(new InvalidInputError('target has no protocol'))
     */
    validOperation(operation) {
      return Promise.resolve(operation);
    }

    /**
     * Builds a read function that reads a given operation.
     * @param {FlamingoOperation} operation
     * @returns {function(FlamingoOperation): Promise.<{type: string, stream: function(): Promise<Stream>}>}
     */
    read(operation) {
      return (op) => op.reader(op);
    }

    /**
     * Preprocesses reader result. Can be used i.e. to transform a non image input to an image stream
     * @param {FlamingoOperation} operation
     * @returns {function(): Promise.<Stream>} function that returns a promise which resolves an image stream
     * @example
     * preprocess(operation) {
     *  return (readerResult) => markdown2Image(operation.request.path.md);
     * }
     */
    preprocess(operation) {
      // same as return (readerResult) => unfoldReaderResult(readerResult);
      return unfoldReaderResult;
    }

    /**
     * Builds a validation function that resolves if the given stream is valid
     * @param operation
     * @returns {function(): Promise.<Stream>}
     */
    validStream(operation) {
      return (stream) => Promise.resolve(stream);
    }

    /**
     * Builds a function that takes a stream and transforms it
     * @param operation
     * @returns {function(Stream):Stream}
     */
    process(operation) {
      // same as return (stream) => transform(stream);
      return imageProcessor(operation);
    }

    /**
     * Builds a function that takes a stream and writes it somewhere.
     * @param operation
     * @returns {function(Stream):Promise}
     */
    write(operation) {
      // same as return (stream) => operation.response.write(stream);
      return operation.writer(operation);
    }

    /**
     * Builds a function that handles a passed error.
     * Defaults to logging and returning a request reply
     * @param operation
     * @returns {function(Error):void}
       */
    handleError(operation) {
      return (err) => {
        logger.error({
          error: err,
          operation: operation
        }, 'Convert error for ' + operation.request.path);
        return errorReply(operation, err);
      };
    }

    /**
     * Overwrites the Routes handle function to start the conversation process
     * @param operation
     * @returns Promise
     * @see flamingo/src/model/Route
     */
    handle(operation) {
      return this.buildOperation(operation).then(buildOperation =>
        this.validOperation(buildOperation)
          .then(this.read(buildOperation))
          .then(this.preprocess(buildOperation))
          .then(this.validStream(buildOperation))
          .then(this.process(buildOperation))
          .then(this.write(buildOperation)))
        .catch(this.handleError(operation));
    }
  }

  return Convert;
};
