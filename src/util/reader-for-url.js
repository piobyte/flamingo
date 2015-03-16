/**
 * @module flamingo/src/util/reader-for-url
 */

var reader = {
        file: require('../reader/file'),
        data: require('../reader/data'),
        http: require('../reader/https'),
        https: require('../reader/https')
    };

/**
 * Tries to find a reader for a given parsed url.
 * @param {Object} parsedUrl object containing a protocol (result of `url.parse(myUrl)`)
 * @param {String|null} parsedUrl.protocol url protocol
 * @returns {Object|undefined} writer if found, `undefined` otherwise
 */
module.exports = function (parsedUrl/*: {protocol:string} */) {
    var foundReader;

    if (parsedUrl.protocol !== null) {
        foundReader = reader[parsedUrl.protocol.substring(0, parsedUrl.protocol.length - 1)];
    }

    return foundReader;
};
