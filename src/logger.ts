/**
 * Logger module
 * @module
 */

import util = require('util');
import pino = require('pino');
import url = require('url');
import pkg = require('../package.json');
import stdSerializers = require('pino-std-serializers');

import FlamingoOperation = require('./model/flamingo-operation');
import Route = require('./model/route');

const { Url } = url as any;

const loggers = {};
// disable stdout logging for test env
function _serializerError(type: string, input: any): SerializerError {
  return {
    _serializerError: `serializer ${type} got invalid input: ${util.inspect(
      input
    )}`
  };
}

const serializers = {
  input(input: any) {
    if (typeof input === 'string') {
      return input;
    } else if (input instanceof Url) {
      return url.format(input);
    } else {
      return util.inspect(input);
    }
  },
  operation(operation: FlamingoOperation | any) {
    return Object.keys(operation).length
      ? {
          input: this.input(operation.input)
        }
      : {};
  },
  route(route: Route | any) {
    return typeof route === 'object' && route.constructor
      ? {
          name: route.constructor.name,
          method: route.method,
          description: route.description,
          path: route.path
        }
      : _serializerError('route', route);
  },
  request: stdSerializers.req,
  error: stdSerializers.err
};

/**
 * Create a bunyan logger using a given name.
 * @see https://github.com/trentm/node-bunyan
 * @param {String} [name=package.name] logger name
 * @returns {Object} bunyan logger
 * @example
 * logger.build('foo') // bunyan logger with name foo
 */
function build(name: string) {
  /* istanbul ignore next */
  name = name || pkg.name;

  /* istanbul ignore else */
  if (!loggers[name]) {
    loggers[name] = pino(
      {
        name,
        serializers
      },
      pino.destination(1)
    );
  }

  return loggers[name];
}

/**
 * Wrapper around bunyan `Logger.prototype.addStream` to add a new stream definitions.
 * It updates all existing loggers and adds the definitions for future logger creations.
 * @see https://github.com/trentm/node-bunyan#streams
 * @param {Object[]} newStreamDefs bunyan stream definitions
 * @return {void}
 * @example
 * logger.addStreams([{
 *  stream: process.stderr,
 *  level: "debug"
 * }]) // adds stderr output for debug level logs
 */
function addStreams(newStreamDefs: any[]) {
  // TODO: this aint workin anymore
  return;
}

export = {
  serializers,
  build,
  addStreams
};
