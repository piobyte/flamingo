'use strict';

const Promise = require('bluebird');
const imageProcessor = require('../processor/image');
const unfoldReaderResult = require('../util/unfold-reader-result');
const responseWriter = require('../writer/response');
const readerForUrl = require('../util/reader-for-url');
const {InvalidInputError} = require('../util/errors');

module.exports = (SuperClass/*:Route*/) => {
  /**
   * Basic mixin that represents the flamingo conversation process.
   * @mixin
   */
  class Convert extends SuperClass {
    /**
     * Resolves if the given operation is valid.
     *
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
     *
     * @param {FlamingoOperation} operation
     * @returns {function(FlamingoOperation): Promise.<{type: string, stream: function(): Promise<Stream>}>}
     */
    read(operation) {
      return (op) => op.reader(op);
    }

    /**
     * Function that preprocesses the reader result.
     * Can be used i.e. to transform a non image input to an image stream.
     *
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
     * Builds a function that takes a stream and transforms it.
     * This is the point where the incoming image stream is transformed.
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
     * Extract a processing instruction from a given operation.
     * The processing instruction can also expose data useful for the response writer.
     *
     * @param {FlamingoOperation} operation
     * @return {Promise.<{process: Array, response: {}}>}
     */
    extractProcess(operation) {
      return Promise.resolve({process: [], response: {}});
    }

    /**
     * Function that resolves a url pointing to the input that should be converted
     *
     * @param {FlamingoOperation} operation
     * @return {Promise.<undefined>}
     */
    extractInput(operation) {
      return Promise.resolve(undefined);
    }

    /**
     * Function that resolves a reader for the given input.
     * Rejects with InvalidInputError if no compatible reader is found.
     *
     * @param {Url} input
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
     * Function that builds an operation for a given request
     * @param {ClientRequest} request incoming http request
     * @param {function} reply hapi reply function
     * @return {Promise.<FlamingoOperation>} Promise that resolves the build operation
     */
    buildOperation(request, reply) {
      return super.buildOperation(request, reply).then(operation =>
        Promise.all([
          this.extractInput(operation),
          this.extractProcess(operation)
        ]).then(([input, {response, process}]) =>
          this.extractReader(input).then(reader => {
            operation.input = input;
            operation.process = process;
            operation.response = response;
            operation.reader = reader;
            operation.writer = responseWriter;

            return operation;
          })));
    }

    /**
     * Overwrites the Routes handle function to start the conversation process
     * @param {FlamingoOperation} operation
     * @returns {Promise} promise that contains the whole convert process
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
