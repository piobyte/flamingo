import Hapi = require("@hapi/hapi");
import merge = require("lodash/merge");
import assert = require("assert");

import Route = require("./route");
import AddonLoader = require("../addon/loader");
import FlamingoOperation = require("./flamingo-operation");
import logger = require("../logger");
import Config = require("../../config");
import Addon = require("../addon/index");
import Profile from "../types/Profile";

const { HOOKS } = Addon;
const { CONF, LOG_STREAM, ENV, START, STOP } = HOOKS;

/**
 * Flamingo server
 * @class
 * @property {Config} config server config
 * @property {AddonLoader} addonsLoader addon loader
 * @property {Object} hapi hapi server instance
 */
class Server {
  config: Config;
  addonsLoader: AddonLoader;
  profiles: { [name: string]: Profile } = {};
  hapi: Hapi.Server;

  /**
   * Takes a config and an addon loader to build the server.
   * @constructor
   * @param {Config} config
   * @param {AddonLoader} addonsLoader
   */
  constructor(config: Config, addonsLoader: AddonLoader) {
    this.config = config;
    FlamingoOperation.prototype.config = this.config;
    this.addonsLoader = addonsLoader;

    this.addonsLoader.hook(CONF)(this.config);
    this.addonsLoader.hook(ENV)(this.config, process.env);
    this.addonsLoader.hook(LOG_STREAM, this.config)(logger, this.config);

    this.profiles = {};

    this.hapi = new Hapi.Server({
      debug: this.config.DEBUG ? { log: ["error"], request: ["error"] } : false,
      port: this.config.PORT,
      host: this.config.HOST,
    });
  }

  /**
   * Add the given routes to the server instance
   * @param {Array.<Route>} routes routes to add to the server instance
   * @returns {Server}
   */
  withRoutes(routes: Array<Route>) {
    routes.forEach((route) => {
      assert.ok(route instanceof Route);
      route.server = this;
      this.hapi.route(route.hapiConfig());
    });
    return this;
  }

  /**
   * Add the given profiles to the server instance
   * @param {Array.<{}>} profiles profiles to add to the server instance
   * @returns {Server}
   */
  withProfiles(profiles) {
    profiles.forEach((profile) => merge(this.profiles, profile));
    return this;
  }

  /**
   * Stop the server instance
   * @return {Promise.<Server>}
   */
  stop() {
    this.addonsLoader.hook(STOP, this)();
    return this.hapi.stop({ timeout: 0 });
  }

  /**
   * Starts the server instance
   * @return {Promise.<Server>}
   */
  start(): Promise<Server> {
    this.addonsLoader.hook(START, this)();
    return this.hapi.start().then(() => this);
  }
}

export = Server;
