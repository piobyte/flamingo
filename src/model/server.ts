import merge = require('lodash/merge');
import assert = require('assert');
import Fastify = require('fastify');
import errors = require('../util/errors');

import Route = require('./route');
import AddonLoader = require('../addon/loader');
import FlamingoOperation = require('./flamingo-operation');
import logger = require('../logger');
import Config = require('../../config');
import Addon = require('../addon/index');
import Profile from '../types/Profile';
import { Reply, Request } from '../types/HTTP';

const { HOOKS } = Addon;
const { CONF, LOG_STREAM, ENV, START, STOP } = HOOKS;
const { InvalidInputError, ProcessingError } = errors;

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
  fastify: Fastify.FastifyInstance;
  uri?: string;

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

    const fastify = Fastify({
      logger: this.config.DEBUG,
      maxParamLength: 200
    });
    fastify.setErrorHandler((error, request, reply) =>
      this.handleError(error, request, reply)
    );
    fastify.decorateRequest('operation', undefined);
    this.fastify = fastify;
  }

  handleError(error, request: Request, reply: Reply) {
    // Log error
    // Send error response
    const isClientError =
      error instanceof InvalidInputError ||
      error instanceof ProcessingError ||
      typeof error === 'string';
    const { config } = this;

    const message = config && config.DEBUG ? error.message : undefined;
    const hasCustomCode = reply.res.statusCode !== 500;
    const code = hasCustomCode
      ? reply.res.statusCode
      : isClientError
      ? 400
      : 500;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const { operation } = request;

    if (isClientError) {
      this.fastify.log.warn({ err: error, operation }, message);
    } else {
      this.fastify.log.error({ err: error, operation }, message);
    }

    reply.code(code).send({ message, code });
  }

  /**
   * Add the given routes to the server instance
   * @param {Array.<Route>} routes routes to add to the server instance
   * @returns {Server}
   */
  withRoutes(routes: Array<Route>) {
    routes.forEach(route => {
      assert.ok(route instanceof Route);
      route.server = this;

      route.registerFastify(this.fastify);
      // this.hapi.route(route.hapiConfig());
    });
    return this;
  }

  /**
   * Add the given profiles to the server instance
   * @param {Array.<{}>} profiles profiles to add to the server instance
   * @returns {Server}
   */
  withProfiles(profiles) {
    profiles.forEach(profile => merge(this.profiles, profile));
    return this;
  }

  /**
   * Stop the server instance
   * @return {Promise.<Server>}
   */
  async stop() {
    this.addonsLoader.hook(STOP, this)();

    await this.fastify.close();

    return this;
  }

  /**
   * Starts the server instance
   * @return {Promise.<Server>}
   */
  async start(): Promise<Server> {
    this.addonsLoader.hook(START, this)();

    this.uri = await this.fastify.listen(this.config.PORT!, this.config.HOST!);

    return this;
  }
}

export = Server;
