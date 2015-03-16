var server = require('./src/server'),
    conf = require('./config'),
    addons = require('./src/addon/loader'),
    addon = require('./src/addon'),
    pkg = require('./package.json'),
    loggerGen = require('./src/logger');

var logger = loggerGen('index');

process.on('uncaughtException', function (err) {
    logger.error(err);
});

addons.load(__dirname, pkg);

addons.hook(addon.HOOKS.CONF)(conf);
addons.hook(addon.HOOKS.ENV)(conf, process.env);

server(conf, addons).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
