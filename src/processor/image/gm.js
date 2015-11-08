/* @flow */
/**
 * GraphicsMagick/ImageMagick image processor module
 * @module flamingo/src/processor/image/gm
 * @see https://github.com/aheckmann/gm
 * @see http://www.imagemagick.org/
 * @see http://www.graphicsmagick.org/
 */

var gm = require('gm'),
  globalConfig = require('../../../config'),
  noop = require('lodash/utility/noop'),
  deprecate = require('../../util/deprecate');

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @param {function} pipeline Function to generate a transformer pipeline that is used with the incoming stream
 * @param {Stream} stream stream containing image
 * @param {Object} config flamingo config
 * @returns {Stream} transformed stream
 * @example
 * image([{ id: 'format', format: 'jpg'}])(fs.createReadStream('sample.png')
 *      .then((resultStream) => {...})
 */

module.exports = function (pipeline/*: function */, stream/*: {pipe: function }*/, config/*: {NATIVE_AUTO_ORIENT: boolean} */)/*: any */ {
  if (!config) {
    deprecate(noop, 'Gm processor called without passing the flamingo config.', {id: 'no-global-config'});
  }

  var conf = config ? config : globalConfig,
    graphics = gm(stream).options({nativeAutoOrient: conf.NATIVE_AUTO_ORIENT});
  return pipeline(graphics).stream();
};
