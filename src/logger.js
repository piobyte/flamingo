/**
 * Logger module
 * @module flamingo/src/logger
 */

var pkg = require('../package.json'),
    bunyan = require('bunyan');

/*eslint no-underscore-dangle: 0*/
var _loggers = {},
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
                streams: streamDefs
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
    build: build,
    addStreams: addStreams
};
