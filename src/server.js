var Hapi = require('hapi'),
    _ = require('lodash-node'),
    RSVP = require('rsvp'),
    pkg = require('../package.json');

var logger = require('./logger')();

var ratifyOptions = {
    apiVersion: pkg.version
};

module.exports = function (serverConfig) {
    return new RSVP.Promise(function (resolve) {
        var server = new Hapi.Server({ debug: false });
        server.connection({
            port: serverConfig.PORT
        });

        // pass server logging to custom logger
        server.on('log', function (ev, tags) { logger.info(_.isArray(tags) ? tags.join(' ') : tags, ev.data); });

        // apply routes
        if (serverConfig.ROUTES.INDEX) {
            server.route(require('./routes/index'));
        }
        if (serverConfig.ROUTES.PROFILE_CONVERT) {
            server.route(require('./routes/profile'));
        }
        if (serverConfig.ROUTES.CUSTOM_CONVERT) {
            server.route(require('./routes/convert'));
        }

        server.register([
            { register: require('./routes/plugins/payload64/index') },
            { register: require('ratify'), options: ratifyOptions }
        ], function (err) {
            if (err) {
                logger.warn('Failed loading plugins', err);
            } else {
                logger.info('Plugins loaded');
                server.start(resolve);
            }
        });
    }).catch(function (err) {
        logger.warn(err);
    });
};
