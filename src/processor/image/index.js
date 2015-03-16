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
 * The function will return a promise and resolve a stream.
 * This stream is converted by gm using the given processing operations.
 *
 * @see https://github.com/aheckman#n/gm
 * @param {Array} processQueue gm processing operations
 * @returns {Function} see description
 * @example
 * image([{ id: 'format', format: 'jpg'}])(fs.createReadStream('sample.png')
 *      .then((resultStream) => {...})
 */
module.exports = function (processQueue) {
    return function (stream) {
        processQueue.forEach(function (item) {
            stream = processors[item.processor](item.pipe, stream);
        });

        return stream;
    };
};
