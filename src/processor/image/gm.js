/* @flow */
/**
 * GraphicsMagick/ImageMagick image processor module
 * @module flamingo/src/processor/image/gm
 * @see https://github.com/aheckmann/gm
 * @see http://www.imagemagick.org/
 * @see http://www.graphicsmagick.org/
 */

var gm = require('optional')('gm'),
  globalConfig = require('../../../config'),
  isFunction = require('lodash/isFunction'),
  noop = require('lodash/noop'),
  logger = require('../../logger').build('processor/image/gm'),
  deprecate = require('../../util/deprecate');

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @param {Object} operation TODO: docs
 * @param {function} pipeline Function to generate a transformer pipeline that is used with the incoming stream
 * @param {Stream} stream stream containing image
 * @returns {Stream} transformed stream
 * @example
 * image([{ id: 'format', format: 'jpg'}])(fs.createReadStream('sample.png')
 *      .then((resultStream) => {...})
 */

module.exports = function (operation/*: FlamingoOperation */, pipeline/*: function */, stream/*: {pipe: function }*/)/*: any */ {
  var conf,
    graphics;

  if (arguments.length === 3 && isFunction(arguments[0])) {
    deprecate(noop, 'gm processor called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    stream = arguments[1];
    conf = arguments[2];
    pipeline = arguments[0];
  } else if (arguments.length === 2) {
    deprecate(noop, 'gm processor called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    conf = globalConfig;
    stream = arguments[1];
    pipeline = arguments[0];
  } else {
    // TODO: operation → args
    conf = operation.config;

  }

  if (gm !== null) {
    graphics = gm(stream).options({nativeAutoOrient: conf.NATIVE_AUTO_ORIENT});
    return pipeline(graphics).stream();
  } else {
    logger.info('`gm` processor disabled, because `gm` isn\'t installed.');
    return stream;
  }
};
