'use strict';

/**
 * Flamingo server
 * @module flamingo/src/model/server
 * @class
 */

const Hapi = require('hapi');
const merge = require('lodash/merge');
const logger = require('../logger');
const addon = require('../addon/index');
const Promise = require('bluebird');
const FlamingoOperation = require('./flamingo-operation');

class Server {
  constructor(conf, addonsLoader) {
    this.conf = conf;
    FlamingoOperation.prototype.config = conf;
    this.addonsLoader = addonsLoader;

    this.addonsLoader.hook(addon.HOOKS.CONF)(this.conf);
    this.addonsLoader.hook(addon.HOOKS.ENV)(this.conf, process.env);
    this.addonsLoader.hook(addon.HOOKS.LOG_STREAM, this.conf)(logger, this.conf);

    this._profiles = {};

    this.hapi = new Hapi.Server({
      debug: {
        log: ['error'],
        request: ['error']
      }
    });
    this.hapi.connection({
      port: this.conf.PORT
    });
  }

  withRoutes(routes) {
    routes.map((route) => {
      route.server = this;
      this.hapi.route(route.hapiConfig());
    });
    return this;
  }

  withProfiles(profiles) {
    profiles.forEach(profile => {
      merge(this._profiles, profile);
    });
    FlamingoOperation.prototype.profiles = this._profiles;
    return this;
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.hapi.stop((err) => {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.hapi.start((err, data) => {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
}

module.exports = Server;
