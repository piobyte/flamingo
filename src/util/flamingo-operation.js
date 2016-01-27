var noop = require('lodash/noop');

function FlamingoOperation() {
  this.request = {};
  this.profile = noop;
  this.reply = noop;

  this.preprocessorConfig = {
    seekPercent: 0.1
  };
  this.processorConfig = {};

  this.reader = noop;
  this.writer = noop;

  this.targetUrl = {};
}

FlamingoOperation.prototype.config = {};
FlamingoOperation.prototype.addons = {};
FlamingoOperation.prototype.profiles = {};

module.exports = FlamingoOperation;
