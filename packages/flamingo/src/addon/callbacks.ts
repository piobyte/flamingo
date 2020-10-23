import envConfig = require("./../util/env-config");
import AddonLoader = require("./loader");
import Addon = require("./index");
import assign = require("lodash/assign");
import partial = require("lodash/partial");
import noop = require("lodash/noop");
import mergeWith = require("lodash/mergeWith");
import Config = require("../../config");
import FlamingoOperation = require("../model/flamingo-operation");
import { ProfileInstruction } from "../types/Instruction";
import { Plugin } from "@hapi/hapi";
import Profile from "../types/Profile";

/**
 * Addon callbacks module
 * @module
 */

const {
  HOOKS: {
    CONF,
    ENV,
    ROUTES,
    HAPI_PLUGINS,
    PROFILES,
    LOG_STREAM,
    EXTRACT_PROCESS,
    START,
    STOP,
  },
} = Addon;

/**
 * Function to be used as merge callback. It's required because by default, lodash isn't keeping a Buffer as a Buffer
 * @see https://github.com/lodash/lodash/issues/1453#issuecomment-139311305
 * @param {*} a
 * @param {*} b
 * @private
 * @returns {Buffer|undefined} b if b is Buffer
 */
function mergeBufferAware(a: any, b: any) {
  if (b instanceof Buffer) {
    return b;
  }
}

/**
 * Register default flamingo addon callbacks
 * @param {object} loader
 * @returns {*}
 */
export = function (loader: AddonLoader): AddonLoader {
  loader.callback(CONF, (conf: Config) => {
    return (addonConf: Config) => {
      // overwrite addon config with config.js content and merge the result into config.js
      mergeWith(
        conf,
        mergeWith(addonConf, conf, mergeBufferAware),
        mergeBufferAware
      );
    };
  });
  loader.callback(
    EXTRACT_PROCESS,
    (extracted: ProfileInstruction, operation: FlamingoOperation) => {
      return function (
        addonExtractFunction: (
          extracted: ProfileInstruction,
          operation: FlamingoOperation
        ) => any
      ) {
        return addonExtractFunction(extracted, operation);
      };
    }
  );
  loader.callback(
    ENV,
    (config: Config, environment: Record<string, string | undefined>) => {
      // call envConfig on the config.js object given the addon env mappings
      return partial(envConfig, config, environment);
    }
  );
  loader.callback(PROFILES, (profiles: Record<string, Profile>) => {
    // put addon profile fields on the existing profiles object
    return partial(assign, profiles);
  });
  // TODO: this doesn't seem to be called
  loader.callback(ROUTES, (server) => {
    // add additional routes
    return server.route.bind(server);
  });
  loader.callback(HAPI_PLUGINS, (plugins: Plugin<unknown>[]) => {
    // add hapi plugins
    return plugins.push.bind(plugins);
  });
  loader.callback(LOG_STREAM, (logger) => {
    // add logger stream
    return logger.addStreams;
  });
  // start and stop do nothing except calling the hook
  loader.callback(START, () => noop);
  loader.callback(STOP, () => noop);

  return loader;
};
