/**
 * Url whitelist module
 * @module
 */
import some = require("lodash/some");
import keys = require("lodash/keys");
import every = require("lodash/every");
import Url = require("url");

/**
 * Check if a given url is on a given whitelist.
 *
 * @param {url} url url to check
 * @param {Array} whitelist Array of protocol fields that are whitelisted
 * @return {boolean} true if the url is whitelisted
 */
export = function readAllowed(
  url: Url.Url,
  whitelist: Array<Partial<Url.Url>> = []
): boolean {
  return some(whitelist, whitelistUrl => {
    return every(keys(whitelistUrl), whitelistKey => {
      // url needs to have the whitelisted key → if not early return
      return (
        !url.hasOwnProperty(whitelistKey) ||
        // check if url and whitelistedUrl have the same value for given key
        url[whitelistKey] === whitelistUrl[whitelistKey]
      );
    });
  });
};
