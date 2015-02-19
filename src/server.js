var Hapi = require('hapi'),
    isArray = require('lodash/lang/isArray'),
    RSVP = require('rsvp'),
    pkg = require('../package.json');

var logger = require('./logger')('server');

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
        server.on('log', function (ev, tags) { logger.info(isArray(tags) ? tags.join(' ') : tags, ev.data); });
        server.on('request-error', function (request, err) {
            logger.error(err);
        });

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
        if (serverConfig.ROUTES.S3) {
            server.route(require('./routes/s3'));
        }

        server.register([
            { register: require('./routes/plugins/payload64/index') },
            { register: require('ratify'), options: ratifyOptions }
        ], function (err) {
            if (err) {
                logger.warn('Failed loading hapi plugins', err);
            } else {
                logger.info('Hapi plugins loaded');
                server.start(resolve);
            }
        });
    }).catch(function (err) {
        logger.warn(err);
    });
};
