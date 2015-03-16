/**
 * Addon module
 * @module flamingo/src/addon
 */

/**
 * Hooks to register addon functionality.
 * @namespace
 * @type {}
 */
exports.HOOKS = {
    /**
     * Hook that allows you to extend environment variable parsing.
     * It must export a function that returns an array of configurations compatible with the `src/util/env-config.js` module.
     * See the `env-config` module documentation for more information.
     *
     * @example
     *   exports[addon.HOOKS.ENV] = function () {
     *       return [
     *           ['AWS_S3_BUCKETS', 'AWS.S3.BUCKETS', envParser.objectList('alias')]
     *       ]
     *   };
     */
    ENV: 'ENV',
    /**
     * Hook that hook allows you to set default parameter for your addon.
     * It must export a function that returns an object.
     * It will merge the addon config object with the flamingo config (`config.js`).
     *
     * @example
     *   exports[addon.HOOKS.CONF] = function () { return {
     *       AWS: {
     *          S3: {
     *              VERSION: '2006-03-01',
     *          }
     *       }
     *   }};
     */
    CONF: 'CONF',
    /**
     * Hook that allows you to register additional profiles that are available inside the profile conversion route (`src/routes/profile.js`).
     * It must export a function that returns an object.
     */
    PROFILES: 'PROFILES',
    /**
     * Hook that allows you to register additional hapi routes.
     * It must export a function that returns an array of route registration objects
     *
     * @see http://hapijs.com/tutorials/routing#routes
     * @example
     * exports[addon.HOOKS.ROUTES] = [{
     *     method: 'GET',
     *     path: '/my/route',
     *     handler: function (req, reply) { // handle request }
     * }]
     */
    ROUTES: 'ROUTES',
    /**
     * Hook that allows you to register additional hapi plugins.
     * It must export a function that returns an array of plugin registrations.
     *
     * @see http://hapijs.com/tutorials/plugins#loading-a-plugin
     */
    HAPI_PLUGINS: 'HAPI_PLUGINS'
};
