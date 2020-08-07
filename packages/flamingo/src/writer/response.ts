/**
 * Flamingo response writer
 * @module
 */
import FlamingoOperation = require("../model/flamingo-operation");

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} Function that replies a given stream
 * @param {FlamingoOperation} operation
 */
export = function ({ reply, response }: FlamingoOperation) {
  return async function (stream) {
    // use through because hapi sometimes didn't trigger the read
    const replyStream = reply.response(stream);

    /* istanbul ignore else */
    if (response && response.header) {
      Object.keys(response.header).forEach((property) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        replyStream.header(property, response.header![property])
      );
    }

    return replyStream;
    // replyStream.on('finish', resolve);
  };
};
