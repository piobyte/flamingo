'use strict';


const Hapi = require('hapi');
const merge = require('lodash/merge');
const logger = require('../logger');
const addon = require('../addon/index');
const Promise = require('bluebird');
const FlamingoOperation = require('./flamingo-operation');
const Route = require('./route');
const assert = require('assert');

/**
 * Flamingo server
 * @class
 */
class Server {
  /**
   * Takes a config and an addon loader to build the server.
   * @constructor
   * @param {Config} conf
   * @param {AddonLoader} addonsLoader
   */
  constructor(conf, addonsLoader) {
    this.conf = conf;
    FlamingoOperation.prototype.config = conf;
    this.addonsLoader = addonsLoader;

    this.addonsLoader.hook(addon.HOOKS.CONF)(this.conf);
    this.addonsLoader.hook(addon.HOOKS.ENV)(this.conf, process.env);
    this.addonsLoader.hook(addon.HOOKS.LOG_STREAM, this.conf)(logger, this.conf);

    this._profiles = {};

    this.hapi = new Hapi.Server({
      debug: conf.DEBUG ? {log: ['error'], request: ['error']} : false
    });
    this.hapi.connection({
      port: this.conf.PORT
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
    profiles.forEach(profile => {
      merge(this._profiles, profile);
    });
    FlamingoOperation.prototype.profiles = this._profiles;
    return this;
  }

  /**
   * Stop the server instance
   * @return {Promise.<Server>}
   */
  stop() {
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
