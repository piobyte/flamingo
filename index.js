var server = require('./src/server'),
    conf = require('./config'),
    addons = require('./src/addon/loader'),
    addon = require('./src/addon'),
    pkg = require('./package.json'),
    supported = require('./src/util/supported'),
    logger = require('./src/logger');

var log = logger.build('index');

process.on('uncaughtException', function (err) {
    log.error(err);
});

addons.load(__dirname, pkg);
addons.hook(addon.HOOKS.CONF)(conf);
addons.hook(addon.HOOKS.ENV)(conf, process.env);
addons.hook(addon.HOOKS.LOG_STREAM, conf)(logger, conf);

supported().then(function(SUPPORTED){
    conf.SUPPORTED = SUPPORTED;
    log.info('starting with supported features', SUPPORTED);
    server(conf, addons).then(function () {
        log.info('Server listening on port ' + conf.PORT);
    }, function (err) {
        log.err(err);
    });
});
