/**
 * Addon module
 * @module flamingo/src/util/unfold-reader-result
 */

/**
 * Function to call the stream method of a given input object
 * @param {Object} readerResult object containing a stream function
 * @param {Function} readerResult.stream Function that returns a stream
 * @returns {Stream} stream
 */
module.exports = function (readerResult/*: {stream: function}*/) {
    return readerResult.stream();
};
