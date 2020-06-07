/**
 * Addon module
 *
 * Flamingo addons only interact with the base flamingo installation using specified hooks, ie.: `"ENV", "CONF", "PROFILES", "ROUTES", "HAPI_PLUGINS"`.
 * Each hook inside an addon must return a function that returns an expected value. To make it easier to change hook names,
 * use the exported `HOOKS` from the `src/addon.js` module (ie. `addon.HOOK.CONF`).
 * @module
 */
import Mapping from "../types/Mapping";
import Server = require("../model/server");
import Profile from "../types/Profile";
import Config = require("../../config");
import bunyan = require("bunyan");
import FlamingoOperation = require("../model/flamingo-operation");
import { ProfileInstruction } from "../types/Instruction";

/**
 * Type for each addon hook type
 */
type HOOK = {
  [HOOKS.ENV]: () => Mapping[];
  [HOOKS.CONF]: () => Record<string, any>;
  [HOOKS.START]: (server: Server) => void;
  [HOOKS.STOP]: (server: Server) => void;
  [HOOKS.PROFILES]: () => { [profileName: string]: Profile };
  [HOOKS.LOG_STREAM]: (conf: Config) => Array<bunyan.Stream>;
  [HOOKS.EXTRACT_PROCESS]: () => (
    profile: ProfileInstruction,
    operation: FlamingoOperation
  ) => ProfileInstruction;
};

/**
 * Hooks to register flamino addon functionality.
 * @enum {string}
 * @readonly
 */
enum HOOKS {
  /**
   * Hook that allows you to extend environment variable parsing.
   * It must export a function that returns an array of configurations, compatible with the `src/util/env-config.js` module.
   * See the `env-config` module documentation for more information.
   *
   * @example
   *   exports[addon.HOOKS.ENV] = function () {
   *       return [
   *           ['AWS_S3_BUCKETS', 'AWS.S3.BUCKETS', JSON.parse]
   *       ]
   *   };
   */
  ENV = "ENV",

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
  CONF = "CONF",

  /**
   * Hook that allows you to register additional profiles that are available inside the profile conversion route (`src/routes/profile.js`).
   * It must export a function that returns an object.
   * @example
   * exports[addon.HOOKS.PROFILES] = {
   *    'my-profile': function (request, query) {
   *        return Promise.resolve({ response: { header: { 'Content-Type': 'image/jpeg' }},
   *            process: [{
   *                processor: 'sharp', pipe: function (pipe) {
   *                    return pipe.resize(200, 200).background('white').flatten().toFormat('jpeg');
   *                }
   *            }]
   *        });
   *    }
   * }
   */
  PROFILES = "PROFILES",

  /**
   * Hook that allows you to register additional hapi routes.
   * It must export a function that returns an array of route registration objects
   *
   * @see http://hapijs.com/tutorials/routing#routes
   * @example
   * exports[addon.HOOKS.ROUTES] = [{
   *     method: 'GET',
   *     path: '/my/route',
   *     handler: function (req, reply) {
   *         // handle request
   *         reply.response('ok');
   *     }
   * }]
   */
  ROUTES = "ROUTES",

  /**
   * Hook that allows you to register additional hapi plugins.
   * It must export a function that returns an array of plugin registrations.
   *
   * @see http://hapijs.com/tutorials/plugins#loading-a-plugin
   */
  HAPI_PLUGINS = "HAPI_PLUGINS",

  /**
   * Hook that allows you to register additional bunyan log streams.
   * Note: As of now, it can't add logs that were generated before the addon is initialized to the addon stream.
   *
   * @see https://github.com/trentm/node-bunyan#streams-introduction
   * @example
   * exports[addon.HOOKS.LOG_STREAM] = [{
   *  stream: process.stderr,
   *  level: "debug"
   * }]
   */
  LOG_STREAM = "LOG_STREAM",

  /**
   * Hook that allows you to modify the result from the convert routes `extractProcess` method.
   * Useful for i.e. modifying the pipe function that converts the image stream.
   * Example adds an Authorization header to the process response.
   * @example
   * exports[EXTRACT_PROCESS] = function () {
   *   return (extracted, operation) => {
   *     extracted.response.header = extracted.response.header || {};
   *     extracted.response.header['Authorization'] = 'Basic 1234';
   *     return extracted;
   *   };
   * };
   */
  EXTRACT_PROCESS = "EXTRACT_PROCESS",

  /**
   * Hook that is called on `Server.start`. Allows to do some initial addon setup.
   * This is useful, i.e. if you want do do something with the fully loaded config.
   * @example
   * exports[START] = function(){
   *   AWS.config.update({
   *     accessKeyId: server.config.accessKeyId,
   *     secretAccessKey: server.config.secretAccessKey
   *   });
   * }
   */
  START = "START",

  /**
   * Same as the `START` hook but called on `Server.stop`.
   */
  STOP = "STOP",
}

export { HOOKS, HOOK };
