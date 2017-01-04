'use strict';

const Hapi = require('hapi');
const merge = require('lodash/merge');
const logger = require('../logger');
const {HOOKS:{CONF, LOG_STREAM, ENV, START, STOP}} = require('../addon/index');
const Promise = require('bluebird');
const FlamingoOperation = require('./flamingo-operation');
const Route = require('./route');
const assert = require('assert');

/**
 * Flamingo server
 * @class
 * @property {Config} config server config
 * @property {AddonLoader} addonsLoader addon loader
 * @property {Object} hapi hapi server instance
 */
class Server {
  /**
   * Takes a config and an addon loader to build the server.
   * @constructor
   * @param {Config} config
   * @param {AddonLoader} addonsLoader
   */
  constructor(config, addonsLoader) {
    this.config = config;
    FlamingoOperation.prototype.config = this.config;
    this.addonsLoader = addonsLoader;

    this.addonsLoader.hook(CONF)(this.config);
    this.addonsLoader.hook(ENV)(this.config, process.env);
    this.addonsLoader.hook(LOG_STREAM, this.config)(logger, this.config);

    this.profiles = {};

    this.hapi = new Hapi.Server({
      debug: this.config.DEBUG ? {log: ['error'], request: ['error']} : false
    });
    this.hapi.connection({
      port: this.config.PORT,
      host: this.config.HOST
    });
  }

  /**
   * Add the given routes to the server instance
   * @param {Array.<Route>} routes routes to add to the server instance
   * @returns {Server}
   */
  withRoutes(routes) {
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
    profiles.forEach(profile =>
      merge(this.profiles, profile));
    return this;
  }

  /**
   * Stop the server instance
   * @return {Promise.<Server>}
   */
  stop() {
    this.addonsLoader.hook(STOP, this)();
    return new Promise((resolve, reject) => {
      this.hapi.stop((err) => {
        /* istanbul ignore next */
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  /**
   * Starts the server instance
   * @return {Promise.<Server>}
   */
  start() {
    this.addonsLoader.hook(START, this)();
    return new Promise((resolve, reject) => {
      this.hapi.start((err, data) => {
        /* istanbul ignore next */
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

module.exports = Server;
