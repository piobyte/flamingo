/**
 * Logger module
 * @module flamingo/src/logger
 */

var pkg = require('../package.json'),
    conf = require('../config'),
    bunyan = require('bunyan');

var loggers = {},
    streams = [],
    ravenClient,
    /**
     * Create a bunyan logger using a given name.
     * @see https://github.com/trentm/node-bunyan
     * @param {String} [name=package.name] logger name
     * @returns {Object} bunyan logger
     */
    genLogger = function (name/*: ?string */) {
        /* istanbul ignore next */
        name = name || pkg.name;

        /* istanbul ignore else */
        if (!loggers[name]) {
            loggers[name] = bunyan.createLogger({
                name: name,
                streams: streams
            });
        }
        return loggers[name];
    };

/* istanbul ignore if */
if (conf.SENTRY_DSN) {
    var raven = require('raven');
    var levels = {};
    levels[bunyan.DEBUG] = 'debug';
    levels[bunyan.INFO] = 'info';
    levels[bunyan.WARN] = 'warning';
    levels[bunyan.ERROR] = 'error';
    levels[bunyan.FATAL] = 'fatal';
    ravenClient = new raven.Client(conf.SENTRY_DSN);

    streams = [{
        level: bunyan.INFO,
        stream: process.stdout
    }, {
        level: bunyan.WARN,
        stream: { write: function (msg) {
            var obj = {};
            try {
                obj = JSON.parse(msg);
            } catch (e) {
                obj.msg = 'error parsing log message';
                obj.level = bunyan.FATAL;
            }
            obj.flamingo = { version: pkg.version };
            ravenClient.captureMessage(obj.msg, {
                level: levels[obj.level],
                extra: obj
            });
        }}
    }];
    genLogger('logger').info('using sentry');
} else {
    streams = [{ stream: process.stdout }];
}

module.exports = genLogger;
