'use strict';

/**
 * Flamingo route
 * @module flamingo/src/model/route
 * @class
 */

var FlamingoOperation = require('./flamingo-operation');

/**
 * Route class is the basic class every route should extend.
 */
class Route {
  constructor(config, method, path, description = '') {
    this.path = path;
    this.method = method;
    this.cors = true;
    this.config = config || {};
    this.description = config.description || description;
    this.parseState = false;
  }

  /**
   * Function that is called for each request.
   * To send the response, call `operation.reply()`.
   *
   * @see {@link http://hapijs.com/api#replyerr-result}
   * @param {FlamingoOperation} operation
     */
  handle(operation) {
    throw 'not implemented';
  }

  /**
   * Function to build the hapi route config object
   * @see {@link http://hapijs.com/api#new-serveroptions}
   * @param {Object} defaults
     */
  hapiConfig(defaults){
    defaults = defaults || {};
    defaults.method = this.method;
    defaults.path = this.path;
    defaults.config = defaults.config || {cors: this.cors, state: { parse: this.parseState }};
    defaults.config.description = this.description;
    defaults.config.handler = (request, reply) => {
      return this.handle(this.buildRequestOperation(request, reply));
    };
    return defaults;
  }

  /**
   * Function to build the flamingo operation based on the incoming request + reply function
   * @param {Request} request
   * @param {function} reply
   * @returns {FlamingoOperation}
   * @see {@link http://hapijs.com/api#request-properties}
     */
  buildRequestOperation(request, reply) {
    const op = new FlamingoOperation();
    op.request = request;
    op.reply = reply;
    return op;
  }
}

// global hash of all profiles
Route.profiles = {};

module.exports = Route;
