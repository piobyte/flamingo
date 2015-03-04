var Hapi = require('hapi'),
    isArray = require('lodash/lang/isArray'),
    profileLoader = require('./util/profile-loader'),
    forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    RSVP = require('rsvp'),
    addon = require('./addon'),
    pkg = require('../package.json');

var logger = require('./logger')('server');

var ratifyOptions = {
    apiVersion: pkg.version
};

module.exports = function (serverConfig, addonLoader) {
    return new RSVP.Promise(function (resolve) {
        var server = new Hapi.Server({ debug: false }),
            serverPlugins = [
                { register: require('ratify'), options: ratifyOptions }
            ];
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

        var profiles = profileLoader.loadAll(serverConfig.PROFILES_DIR);
        addonLoader.hook(addon.HOOKS.PROFILES, { conf: serverConfig }, function(addonProfiles) {
            assign(profiles, addonProfiles); });
        addonLoader.hook(addon.HOOKS.ROUTES, { conf: serverConfig, profiles: profiles },
            server.route.bind(server));
        addonLoader.hook(addon.HOOKS.HAPI_PLUGINS, { conf: serverConfig }, function(addonPlugins){
            serverPlugins = serverPlugins.concat(addonPlugins);
        });

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
