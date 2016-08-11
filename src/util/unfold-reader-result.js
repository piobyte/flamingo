/* @flow */
/**
 * Addon module
 * @module
 */

/**
 * Function to call the stream method of a given input object
 * @param {Object} object object containing a stream function
 * @param {Function} object.stream Function that returns a stream
 * @returns {Stream} stream
 */
module.exports = function (object/*: {stream: function}*/)/*: function */ {
  return object.stream();
};
