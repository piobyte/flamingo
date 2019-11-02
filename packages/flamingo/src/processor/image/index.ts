/**
 * Image processor module
 * @module
 */
import forEach = require("lodash/forEach");
import optional = require("optional");
import nodeStream = require("stream");

import sharp = require("./sharp");
import gm = require("./gm");
import FlamingoOperation = require("../../model/flamingo-operation");
import Logger = require("../../logger");

const { build } = Logger;
const logger = build("processor/image");

const processors: {
  sharp: any;
  gm?: any;
} = {
  sharp
};

if (optional("gm") !== null) {
  // TODO: does this work?
  processors.gm = gm;
} else {
  logger.info("`gm` processor disabled, because `gm` isn't installed.");
}

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * This stream is converted using the given transformations array.
 *
 * @param {Object} operation flamingo operation
 * @returns {Function} function to convert a stream
 * @example
 * image([{ processor: 'sharp', pipe: (sharp) => sharp.toFormat('jpeg') }])(fs.createReadStream('sample.png')
 * // converted image stream
 */
export = function(operation: FlamingoOperation) /*: function */ {
  const transformations = operation.process;

  return function(stream: nodeStream.Readable) {
    forEach(transformations, transformation => {
      if (processors.hasOwnProperty(transformation.processor)) {
        stream = processors[transformation.processor](
          operation,
          transformation.pipe,
          stream
        );
      } else {
        logger.info(
          `Skipping transformation, unknown processor: ${transformation.processor}`
        );
      }
    });

    return stream;
  };
};
