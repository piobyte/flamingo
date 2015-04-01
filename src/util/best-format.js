/**
 * Accept header media type parsing module
 * @module flamingo/src/util/best-format
 */

var mimeparse = require('mimeparse');

function parseRanges(ranges) {
    var parsedRanges = [],
        rangeParts = ranges.split(',');
    for (var i = 0; i < rangeParts.length; i++) {
        parsedRanges.push(mimeparse.parseMediaRange(rangeParts[i]));
    }
    return parsedRanges;
}

var DEFAULT_SUPPORTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/tiff'];

/**
 * Function to get a media type from a given accept handler using a default media type as fallback.
 * @param {string} acceptHeader accept request-header
 * @param {string} defaultMime fallback media type
 * @returns {{mime: String, type: String}} best fitting media type object
 * @example
 * bestFormat('image/webp,*\/*;q=0.8', 'image/png')
 * // {mime: 'image/webp', type: 'webp'}
 *
 * bestFormat('*\/*;q=0.8', 'image/png')
 * // {mime: 'image/png', type: 'png'}
 *
 * bestFormat('image/jpeg,image/png,image/svg+xml,image/*;q=0.8,*\/*;q=0.5', 'image/png')
 * // {mime: 'image/jpeg', type: 'jpeg'}
 */
module.exports = function (acceptHeader, defaultMime) {
    if (acceptHeader) {
        var parsedHeader = parseRanges(acceptHeader),
            joinedParsedHeader = parsedHeader.map(function (h) {
                return h[0] + '/' + h[1];
            }),
            bestMatch,
            highestFitness = 0,
            highestSupported;

        highestSupported = DEFAULT_SUPPORTED.map(function (supportedMime) {
            var fitnessQuality = mimeparse.fitnessAndQualityParsed(supportedMime, parsedHeader);
            highestFitness = Math.max(highestFitness, fitnessQuality[0]);
            return {
                mime: supportedMime,
                fitness: fitnessQuality[0]
            };
        }).filter(function (parsed) {
            return parsed.fitness === highestFitness;
        }).map(function (parsed) {
            return parsed.mime;
        }).sort(function (a, b) {
            /* eslint no-else-return: 0 */
            var aIndex = joinedParsedHeader.indexOf(a),
                bIndex = joinedParsedHeader.indexOf(b);

            if (aIndex === bIndex) { return 0; }
            /* istanbul ignore next */
            if (aIndex === -1 && bIndex > 0) {
                return 1;
            } else if (bIndex === -1 && aIndex > 0) {
                return -1;
            } else {
                return aIndex < bIndex ? -1 : 1;
            }
        });

        if (highestSupported.length === 1) {
            bestMatch = highestSupported[0];
            /* istanbul ignore else */
        } else if (highestSupported.length > 1) {
            // take first element
            bestMatch = highestSupported[0];
        }
    } else {
        bestMatch = defaultMime;
    }

    return typeof bestMatch === 'string' ?
        { mime: bestMatch, type: bestMatch.split('/')[1]} :
        { mime: defaultMime, type: defaultMime.split('/') };
};
