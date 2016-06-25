'use strict';

/**
 * @module flamingo/src/model/flamingo-operation
 */

var noop = require('lodash/noop');

/**
 * Base operation class that is intented to be created for each request and holds request metadata.
 * @class
 */
class FlamingoOperation {
  constructor() {
    this.request = {};
    this.profile = noop;
    this.reply = noop;

    this.preprocessorConfig = {
      seekPercent: 0.1
    };
    this.processorConfig = {};

    this.reader = noop;
    this.writer = noop;

    this.input = undefined;
  }
}

FlamingoOperation.prototype.config = {};
FlamingoOperation.prototype.profiles = {};

module.exports = FlamingoOperation;
