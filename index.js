var server = require('./src/server'),
    conf = require('./config');

var logger = require('./src/logger')();

process.on('uncaughtException', function (err) {
    logger.error(err);
});

server(conf).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
