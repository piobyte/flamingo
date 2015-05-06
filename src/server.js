var Hapi = require('hapi'),
    isArray = require('lodash/lang/isArray'),
    merge = require('lodash/object/merge'),
    RSVP = require('rsvp'),
    fs = require('fs'),
    path = require('path'),
    addon = require('./addon'),
    deprecate = require('./util/deprecate'),
    pkg = require('../package.json');

var logger = require('./logger')('server'),
    Promise = RSVP.Promise,
    DEBUG_PROFILES_FILE = 'debug.js';

var ratifyOptions = {
    apiVersion: pkg.version
};

module.exports = function (serverConfig, addons) {
    return new Promise(function (resolve) {
        var server = new Hapi.Server({debug: false}),
            serverPlugins = [{register: require('ratify'), options: ratifyOptions}],
            flamingo = {conf: serverConfig, profiles: {}, addons: addons};

        server.connection({
            port: serverConfig.PORT
        });

        // pass server logging to custom logger
        server.on('log', function (ev, tags) {
            logger.info(isArray(tags) ? tags.join(' ') : tags, ev.data);
        });
        server.on('request-error', function (request, err) {
            logger.error(err);
        });

        var profilesPath = path.join(__dirname, 'profiles');
        /*eslint no-sync: 0*/
        fs.readdirSync(profilesPath).filter(function (file) {
            return serverConfig.DEBUG ? file : file !== DEBUG_PROFILES_FILE;
        }).forEach(function (file) {
            merge(flamingo.profiles, require(path.join(profilesPath, file)));
        });

        addons.hook(addon.HOOKS.PROFILES)(flamingo.profiles);
        addons.hook(addon.HOOKS.ROUTES, flamingo)(server);
        addons.hook(addon.HOOKS.HAPI_PLUGINS, flamingo)(serverPlugins);

        logger.info('available profiles', Object.keys(flamingo.profiles));

        // apply routes
        if (serverConfig.ROUTES.INDEX) {
            server.route(require('./routes/index')(flamingo));
        }
        if (serverConfig.ROUTES.PROFILE_CONVERT_IMAGE) {
            var imageRequestHandler = require('./routes/convert/image')(flamingo);

            // image converter
            server.route(imageRequestHandler);

            // deprecated image convert route
            server.route({
                method: 'GET', path: '/convert/{profile}/{url}', handler: function (req, reply) {
                    deprecate(function () {
                            imageRequestHandler.config.handler(req, reply);
                        },
                        '/convert/{profile}/{url} will be removed before 1.0.0. Use /convert/image/{profile}/{url} instead.');
                }
            });
        }
        if (serverConfig.ROUTES.PROFILE_CONVERT_VIDEO) {
            server.route(require('./routes/convert/video')(flamingo));
        }
        if (serverConfig.DEBUG) {
            server.route(require('./routes/debug')(flamingo));
        }

        server.register(serverPlugins, function (err) {
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
