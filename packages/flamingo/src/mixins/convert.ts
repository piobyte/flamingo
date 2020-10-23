import Url = require("url");
import Hapi = require("@hapi/hapi");
import nodeStream = require("stream");

import Route = require("../model/route");
import imageProcessor = require("../processor/image");
import unfoldReaderResult = require("../util/unfold-reader-result");
import responseWriter = require("../writer/response");
import readerForUrl = require("../util/reader-for-url");
import FlamingoOperation = require("../model/flamingo-operation");
import errors = require("../util/errors");
import Addon = require("../addon");
import Constructor from "../model/Constructor";
import { ProfileInstruction } from "../types/Instruction";
import Server = require("../model/server");
import Config = require("../../config");
import { ReaderResult } from "../types/ReaderResult";

const { InvalidInputError } = errors;
const { HOOKS } = Addon;
const { EXTRACT_PROCESS } = HOOKS;

export = function Convert<T extends Constructor<Route>>(Base: T) {
  /**
   * Basic mixin that represents the flamingo conversation process.
   * @mixin
   */
  return class Convert extends Base {
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
    validOperation(operation: FlamingoOperation): Promise<FlamingoOperation> {
      return Promise.resolve(operation);
    }

    /**
     * Builds a read function that reads a given operation.
     *
     * @param {FlamingoOperation} operation
     * @returns {function(FlamingoOperation): Promise.<{type: string, stream: function(): Promise<Stream>}>}
     */
    read(
      operation: FlamingoOperation
    ): (op: FlamingoOperation) => Promise<ReaderResult> {
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
    preprocess(
      operation: FlamingoOperation
    ): (result: ReaderResult) => Promise<nodeStream.Readable> {
      // same as return (readerResult) => unfoldReaderResult(readerResult);
      return unfoldReaderResult;
    }

    /**
     * Builds a validation function that resolves if the given stream is valid
     * @param {FlamingoOperation} operation
     * @returns {function(): Promise.<Stream>}
     */
    validStream(
      operation: FlamingoOperation
    ): (stream: nodeStream.Readable) => Promise<nodeStream.Readable> {
      return (stream: nodeStream.Readable) => Promise.resolve(stream);
    }

    /**
     * Builds a function that takes a stream and transforms it.
     * This is the point where the incoming image stream is transformed.
     * @param {FlamingoOperation} operation
     * @returns {function(Stream):Stream}
     */
    process(
      operation: FlamingoOperation
    ): (stream: nodeStream.Readable) => nodeStream.Readable {
      // same as return (stream) => transform(stream);
      return imageProcessor(operation);
    }

    /**
     * Builds a function that takes a stream and writes it somewhere.
     * @param {FlamingoOperation} operation
     * @returns {function(Stream):Promise}
     */
    write(
      operation: FlamingoOperation
    ): (stream: nodeStream.Readable) => Promise<any> | void {
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
    extractProcess(operation: FlamingoOperation): Promise<ProfileInstruction> {
      return Promise.resolve({ process: [], response: {} });
    }

    /**
     * Function that resolves a url pointing to the input that should be converted
     *
     * @param {FlamingoOperation} operation
     * @return {Promise.<undefined>}
     */
    extractInput(operation: FlamingoOperation): Promise<any> {
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
    extractReader(input: Url.Url): Promise<any> {
      const reader = readerForUrl(input);

      if (!reader) {
        return Promise.reject(
          new InvalidInputError("No reader available for given input", input)
        );
      }

      return Promise.resolve(reader);
    }

    /**
     * Function that builds an operation for a given request.
     * Note: don't overwrite the buildOperation, if you don't know what you're doing.
     * It's the core convert method that calls other convert methods, used in other mixins.
     *
     * @param {ClientRequest} request incoming http request
     * @param {function} reply hapi reply function
     * @return {Promise.<FlamingoOperation>} Promise that resolves the build operation
     */
    buildOperation(request: Hapi.Request, reply: Hapi.ResponseToolkit) {
      const server = this.server;
      return super.buildOperation(request, reply).then((operation) =>
        Promise.all([
          this.extractInput(operation),
          this.extractProcess(operation).then((extracted) => {
            server.addonsLoader.hook(EXTRACT_PROCESS)(extracted, operation);
            return extracted;
          }),
        ]).then(([input, { response, process }]) =>
          this.extractReader(input).then((reader) => {
            operation.input = input;
            operation.process = process;
            operation.response = response;
            operation.reader = reader;
            operation.writer = responseWriter;

            return operation;
          })
        )
      );
    }

    /**
     * Overwrites the Routes handle function to start the conversation process
     * @param {FlamingoOperation} operation
     * @returns {Promise} promise that contains the whole convert process
     * @see flamingo/src/model/Route
     */
    handle(operation: FlamingoOperation) {
      return this.validOperation(operation)
        .then(this.read(operation))
        .then(this.preprocess(operation))
        .then(this.validStream(operation))
        .then(this.process(operation))
        .then(this.write(operation));
    }
  };
};
