'use strict';

const noop = require('lodash/noop');

/**
 * Base operation class that is intented to be created for each request and holds request metadata.
 * @class
 *
 */
class FlamingoOperation {
  constructor() {
    /** @member {Request} */
    this.request = {};
    /** @member {function} */
    this.profile = noop;
    /** @member {function} */
    this.reply = noop;

    this.preprocessorConfig = {
      seekPercent: 0.1
    };
    this.processorConfig = {};

    /** @member {function} */
    this.reader = noop;
    /** @member {function} */
    this.writer = noop;

    /** @member */
    this.input = undefined;
  }
}

/** @member object */
FlamingoOperation.prototype.config = {};
/** @member object */
FlamingoOperation.prototype.profiles = {};

module.exports = FlamingoOperation;
