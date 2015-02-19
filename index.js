var server = require('./src/server'),
    conf = require('./config'),
    loggerGen = require('./src/logger');

var logger = loggerGen('index');

process.on('uncaughtException', function (err) {
    logger.error(err);
});

if (conf.MEMWATCH) {
    logger.info('using memwatch');
    var memwatch = require('memwatch');
    var memLog = loggerGen('memwatch');

    memwatch.on('leak', function (info) {
        memLog.warn('leak', info);
    });
    memwatch.on('stats', function (stats) {
        memLog.info('gc', stats);
    });
}

server(conf).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
