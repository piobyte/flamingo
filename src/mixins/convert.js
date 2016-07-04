'use strict';

const Promise = require('bluebird');
const imageProcessor = require('../processor/image');
const unfoldReaderResult = require('../util/unfold-reader-result');

module.exports = (SuperClass/*:Route*/) => {
  /**
   * Basic mixin that represents the flamingo conversation process.
   * @mixin
   */
  class Convert extends SuperClass {
    /**
     * Resolves if the given operation is valid
     * @param {FlamingoOperation} operation
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
     * @param {FlamingoOperation} operation
     * @returns {function(): Promise.<Stream>}
     */
    validStream(operation) {
      return (stream) => Promise.resolve(stream);
    }

    /**
     * Builds a function that takes a stream and transforms it
     * @param {FlamingoOperation} operation
     * @returns {function(Stream):Stream}
     */
    process(operation) {
      // same as return (stream) => transform(stream);
      return imageProcessor(operation);
    }

    /**
     * Builds a function that takes a stream and writes it somewhere.
     * @param {FlamingoOperation} operation
     * @returns {function(Stream):Promise}
     */
    write(operation) {
      // same as return (stream) => operation.response.write(stream);
      return operation.writer(operation);
    }

    /**
     * Overwrites the Routes handle function to start the conversation process
     * @param {FlamingoOperation} operation
     * @returns Promise
     * @see flamingo/src/model/Route
     */
    handle(operation) {
      return this.validOperation(operation)
        .then(this.read(operation))
        .then(this.preprocess(operation))
        .then(this.validStream(operation))
        .then(this.process(operation))
        .then(this.write(operation));
    }
  }

  return Convert;
};
