/**
 * Flamingo route
 * @class
 */
import Fastify = require('fastify');

import Logger = require('../logger');
import Server = require('./server');
import Config = require('../../config');
import FlamingoOperation = require('./flamingo-operation');
import { Reply, Request } from '../types/HTTP';

const { build } = Logger;
const logger = build('model.route');

/**
 * Route class is the basic class every route should extend.
 * The idea is that an incoming request generates a FlamingoOperation
 * which is passed through the route and used to store metadata.
 */
class Route {
  path: string;
  method: 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS';
  config: Config;
  description: string;
  parseState: boolean = false;
  cors: boolean = true;
  server: Server;

  /**
   *
   * @param {Config} config
   * @param {string} method the routes http method
   * @param {string} path the routes url path
   * @param {string} [description=''] route description
   */
  constructor(config, method, path, description = '') {
    this.path = path;
    this.method = method;
    this.cors = true;
    this.config = config || {};
    if (description.length) {
      this.description = description;
    }
    this.parseState = false;
  }

  /**
   * Function that is called for each request.
   * To send the response, call `operation.reply()`.
   *
   * @see {@link http://hapijs.com/api#replyerr-result}
   * @param {FlamingoOperation} operation
   */
  handle(operation): Promise<any> {
    return Promise.reject(new Error('Method not implemented: Route.handle()'));
  }

  registerFastify(fastify: Fastify.FastifyInstance) {
    const { method } = this;
    let { path } = this;

    if (path.includes('{')) {
      // TODO has old hapi url
      path = path.replace(/{\w+}/g, n => `:${n.substring(1, n.length - 1)}`);
      logger.info(`found hapi url variable pattern, replaced to ${path}`);
    }

    fastify.route({
      method,
      url: path,
      handler: async (request, reply) => {
        // can't use preHandler as it's not calling the server.errorHandler on rejection
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        request.operation = await this.buildOperation(request, reply);

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        return this.handle(request.operation);
      }
    });
  }

  /**
   * Function to build the flamingo operation based on the incoming request + reply function.
   * Each extending class should call super.buildOperation to get a minimal working flamingo operation.
   * @param {Request} request
   * @param {function} reply
   * @returns {Promise.<FlamingoOperation>}
   * @see {@link http://hapijs.com/api#request-properties}
   */
  buildOperation(request: Request, reply: Reply) {
    const op = new FlamingoOperation();
    op.request = request;
    op.reply = reply;
    op.config = this.config;
    return Promise.resolve(op);
  }
}

export = Route;
