/* @flow weak */
/**
 * Image processor module
 * @module flamingo/src/processor/image
 */

var processors = {
    sharp: require('./sharp'),
    gm: require('./gm')
};

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * This stream is converted using the given transformations array.
 *
 * @param {Array} transformations of processor transformations
 * @returns {Function} function to convert a stream
 * @example
 * image([{ processor: 'sharp', pipe: (sharp) => sharp.toFormat('jpeg') }])(fs.createReadStream('sample.png')
 * // converted image stream
 */
module.exports = function (transformations/*: Array<{processor: string; pipe: function}>*/)/*: function */ {
    return function (stream) {
        transformations.forEach(function (item) {
            stream = processors[item.processor](item.pipe, stream);
        });

        return stream;
    };
};
