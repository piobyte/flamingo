/* @flow weak */
/**
 * Logger module
 * @module
 */

const pkg = require('../package');
const util = require('util');
const bunyan = require('bunyan');
const url = require('url');

const loggers = {};
// disable stdout logging for test env
let streamDefs = process.env.TEST ? [] /* istanbul ignore next */ : [{stream: process.stdout}];

function _serializerError(type, input) {
  return {_serializerError: 'serializer ' + type + ' got invalid input: ' + util.inspect(input)};
}

const serializers = {
  input(input){
    if (typeof input === 'string') {
      return input;
    } else if (input instanceof url.Url) {
      return url.format(input);
    } else {
      return util.inspect(input);
    }
  },
  operation: function (operation) {
    return Object.keys(operation).length ? {
      input: this.input(operation.input),
      request: this.request(operation.request)
    } : {};
  },
  route: function (route) {
    return typeof route === 'object' && route.constructor ? {
      name: route.constructor.name,
      method: route.method,
      description: route.description,
      path: route.path
    } : _serializerError('route', route);
  },
  request: function (request) {
    return typeof request === 'object' && request.hasOwnProperty('path') && request.hasOwnProperty('method') ? {
      headers: request.headers,
      path: request.path,
      method: request.method
    } :
      _serializerError('request', request);
  },
  error: function (error) {
    const type = typeof error;

    switch (type) {
      case 'object':
        // via http://stackoverflow.com/a/18391400
        return Object.getOwnPropertyNames(error).reduce(function (raw, key) {
          raw[key] = error[key];
          return raw;
        }, {});
      case 'string':
        return {message: error};
      default:
        return _serializerError('error', error);
    }
  }
};

/**
 * Create a bunyan logger using a given name.
 * @see https://github.com/trentm/node-bunyan
 * @param {String} [name=package.name] logger name
 * @returns {Object} bunyan logger
 * @example
 * logger.build('foo') // bunyan logger with name foo
 */
function build(name/*: ?string */) {
  /* istanbul ignore next */
  name = name || pkg.name;

  /* istanbul ignore else */
  if (!loggers[name]) {
    loggers[name] = bunyan.createLogger({
      name: name,
      streams: streamDefs,
      serializers: serializers
    });
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
function addStreams(newStreamDefs) {
  // add def to defs for future loggers
  streamDefs = streamDefs.concat(newStreamDefs);

  // update existing loggers
  Object.keys(loggers).forEach(function (loggerName) {
    newStreamDefs.forEach(function (streamDef) {
      loggers[loggerName].addStream(streamDef);
    });
  });
}

module.exports = {
  serializers: serializers,
  build: build,
  addStreams: addStreams
};
