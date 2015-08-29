/* @flow weak */
/**
 * vips image processor module
 * @module flamingo/src/processor/image/sharp
 * @see https://github.com/lovell/sharp
 * @see http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS
 */

var sharp = require('sharp');

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @param {function} pipeline Function to generate a transformer pipeline that is used with the incoming stream
 * @param {Stream} stream stream containing image
 * @returns {Stream} transformed stream
 * @example
 * sharpProcessor((sharpInstance) => sharpInstance.rotate(), fs.createReadStream('sample.png'))
 */

module.exports = function (pipeline/*: function */, stream) {
  var pipe = pipeline(sharp());
  return stream.pipe(pipe);
};
