/**
 * Logger module
 * @module flamingo/src/logger
 */

var pkg = require('../package.json'),
  util = require('util'),
  bunyan = require('bunyan');

/*eslint no-underscore-dangle: 0*/
var _loggers = {},
  _serializerError = function (type, input) {
    return {_serializerError: 'serializer ' + type + ' got invalid input: ' + util.inspect(input)};
  },
  serializers = {
    request: function (request) {
      return typeof request === 'object' && request.hasOwnProperty('route') ? {
        headers: request.headers,
        path: request.path,
        route: {
          path: request.route.path,
          method: request.route.method
        },
        method: request.method
      } :
        _serializerError('request', request);
    },
    error: function (error) {
      // via http://stackoverflow.com/a/18391400
      return typeof error === 'object' ?
        Object.getOwnPropertyNames(error).reduce(function (raw, key) {
          raw[key] = error[key];
          return raw;
        }, {}) :
        _serializerError('error', error);
    }
  },
// disable stdout logging for test env
  streamDefs = process.env.TEST ? [] /* istanbul ignore next */ : [{stream: process.stdout}],
  /**
   * Create a bunyan logger using a given name.
   * @see https://github.com/trentm/node-bunyan
   * @param {String} [name=package.name] logger name
   * @returns {Object} bunyan logger
   * @example
   * logger.build('foo') // bunyan logger with name foo
   */
  build = function (name/*: ?string */) {
    /* istanbul ignore next */
    name = name || pkg.name;

    /* istanbul ignore else */
    if (!_loggers[name]) {
      _loggers[name] = bunyan.createLogger({
        name: name,
        streams: streamDefs,
        serializers: serializers
      });
    }

    return _loggers[name];
  },

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
  addStreams = function (newStreamDefs) {
    // add def to defs for future loggers
    streamDefs = streamDefs.concat(newStreamDefs);

    // update existing loggers
    Object.keys(_loggers).forEach(function (loggerName) {
      newStreamDefs.forEach(function (streamDef) {
        _loggers[loggerName].addStream(streamDef);
      });
    });
  };

module.exports = {
  serializers: serializers,
  build: build,
  addStreams: addStreams
};
