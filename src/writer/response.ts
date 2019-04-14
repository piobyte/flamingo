/**
 * Flamingo response writer
 * @module
 */
import FlamingoOperation = require('../model/flamingo-operation');

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} Function that replies a given stream
 * @param {FlamingoOperation} operation
 */
export = function({ reply, response }: FlamingoOperation) {
  return async function(stream) {
    return reply.headers((response && response.header) || {}).send(stream);
  };
};
