var pkgName = require('../package.json').name,
    bunyan = require('bunyan');

var loggers = {};

module.exports = function (name) {
    name = name || pkgName;
    if (!loggers[name]) {
        loggers[name] = bunyan.createLogger({name: name});
    }
    return loggers[name];
};
