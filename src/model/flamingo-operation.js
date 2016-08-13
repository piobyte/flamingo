'use strict';

const noop = require('lodash/noop');

/**
 * Base operation class that is intented to be created for each request and holds request metadata.
 * @class
 * @property {Request} request
 * @property {function} profile
 * @property {function} reply
 * @property {function} reader
 * @property {function} writer
 * @property {*} input
 */
class FlamingoOperation {
  constructor() {
    this.request = {};
    this.reply = noop;

    this.preprocessorConfig = {
      seekPercent: 0.1
    };

    this.reader = noop;
    this.writer = noop;
    this.input = undefined;

    this.process = [];
    this.response = {};
  }
}

/**
 * global flamingo config
 * @static
 * @property {Config} config
 */
FlamingoOperation.prototype.config = {};

/**
 * global profiles object
 * @static
 * @property {{}} profiles
 */
FlamingoOperation.prototype.profiles = {};

module.exports = FlamingoOperation;
