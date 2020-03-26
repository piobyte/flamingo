/**
 * GraphicsMagick/ImageMagick image processor module
 * @module
 * @see https://github.com/aheckmann/gm
 * @see http://www.imagemagick.org/
 * @see http://www.graphicsmagick.org/
 */

import optional = require("optional");
import Logger = require("../../logger");
import FlamingoOperation = require("../../model/flamingo-operation");

const { build } = Logger;
const gm = optional("gm");
const logger = build("processor/image/gm");

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @param {object} operation
 * @param {function} pipeline Function to generate a transformer pipeline that is used with the incoming stream
 * @param {Stream} stream stream containing image
 * @returns {Stream} transformed stream
 * @example
 * image([{ id: 'format', format: 'jpg'}])(fs.createReadStream('sample.png')
 *      .then((resultStream) => {...})
 */
export = function (
  operation: FlamingoOperation,
  pipeline /*: function */,
  stream /*: {pipe: function }*/
) /*: any */ {
  if (gm !== null) {
    const graphics = gm(stream).options({
      nativeAutoOrient: operation.config.NATIVE_AUTO_ORIENT,
    });
    return pipeline(graphics).stream();
  } else {
    logger.info("`gm` processor disabled, because `gm` isn't installed.");
    return stream;
  }
};
