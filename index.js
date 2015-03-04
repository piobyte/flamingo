var server = require('./src/server'),
    conf = require('./config'),
    forEach = require('lodash/collection/forEach'),
    merge = require('lodash/object/merge'),
    addonLoader = require('./src/addon-loader'),
    addon = require('./src/addon'),
    pkg = require('./package.json'),
    envConfig = require('./src/util/env-config'),
    loggerGen = require('./src/logger');

var logger = loggerGen('index');

process.on('uncaughtException', function (err) {
    logger.error(err);
});

addonLoader.load(__dirname, pkg);
addonLoader.hook(addon.HOOKS.CONF, function (addonConf) { merge(conf, merge(addonConf, conf)); });
addonLoader.hook(addon.HOOKS.ENV, function (addonEnv) { envConfig(conf, process.env, addonEnv); });

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

server(conf, addonLoader).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
