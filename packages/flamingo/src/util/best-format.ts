/**
 * Accept header media type parsing module
 * @module
 */

// @ts-ignore
import mimeparse = require("mimeparse");
import { Mime } from "../types/Mime";
// ["application", "xhtml", { "q" : "0.5" }]

type ParsedRange = [string, string, { q: string }];

function parseRanges(ranges: string) {
  const parsedRanges: ParsedRange[] = [];
  const rangeParts = ranges.split(",");

  for (let i = 0; i < rangeParts.length; i++) {
    parsedRanges.push(mimeparse.parseMediaRange(rangeParts[i]));
  }

  return parsedRanges;
}

const DEFAULT_SUPPORTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
];

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
export = function (acceptHeader: any, defaultMime: string = "image/png"): Mime {
  let bestMatch;

  if (typeof acceptHeader === "string") {
    const parsedHeader = parseRanges(acceptHeader);
    const joinedParsedHeader = parsedHeader.map(
      ([type, subtype]) => `${type}/${subtype}`
    );

    let highestFitness = 0;

    const highestSupported = DEFAULT_SUPPORTED.map((supportedMime) => {
      const fitnessQuality = mimeparse.fitnessAndQualityParsed(
        supportedMime,
        parsedHeader
      );
      highestFitness = Math.max(highestFitness, fitnessQuality[0]);
      return {
        mime: supportedMime,
        fitness: fitnessQuality[0],
      };
    })
      .filter((parsed) => parsed.fitness === highestFitness)
      .map(({ mime }) => mime)
      .sort((a, b) => {
        /* eslint no-else-return: 0 */
        const aIndex = joinedParsedHeader.indexOf(a);
        const bIndex = joinedParsedHeader.indexOf(b);

        if (aIndex === bIndex) {
          return 0;
        }
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

  return typeof bestMatch === "string"
    ? { mime: bestMatch, type: bestMatch.split("/")[1] }
    : { mime: defaultMime, type: defaultMime.split("/")[1] };
};
