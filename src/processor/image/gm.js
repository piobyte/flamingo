/* @flow weak */
/**
 * GraphicsMagick/ImageMagick image processor module
 * @module flamingo/src/processor/image/gm
 * @see https://github.com/aheckmann/gm
 * @see http://www.imagemagick.org/
 * @see http://www.graphicsmagick.org/
 */

var conf = require('../../../config'),
  gm = require('gm');

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @param {function} pipeline Function to generate a transformer pipeline that is used with the incoming stream
 * @param {Stream} stream stream containing image
 * @returns {Stream} transformed stream
 * @example
 * image([{ id: 'format', format: 'jpg'}])(fs.createReadStream('sample.png')
 *      .then((resultStream) => {...})
 */

module.exports = function (pipeline/*: function */, stream) {
  var graphics = gm(stream).options({nativeAutoOrient: !!conf.NATIVE_AUTO_ORIENT});
  return pipeline(graphics).stream();
};
