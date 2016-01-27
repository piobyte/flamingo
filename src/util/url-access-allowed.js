/* @flow */
/**
 * Url whitelist module
 * @module flamingo/src/util/read-allowed
 */
var some = require('lodash/some'),
  keys = require('lodash/keys'),
  every = require('lodash/every');

/**
 * Check if a given url is on a given whitelist.
 *
 * @param {url} url url to check
 * @param {Array} whitelist Array of protocol fields that are whitelisted
 * @return {boolean} true if the url is whitelisted
 */
module.exports = function readAllowed(url/*: UrlParse */, whitelist/*: Array<UrlParse> */)/*: boolean */ {
  return some(whitelist, function (whitelistUrl) {
    return every(keys(whitelistUrl), function (whitelistKey) {
      // url needs to have the whitelisted key → if not early return
      return !url.hasOwnProperty(whitelistKey) ||
          // check if url and whitelistedUrl have the same value for given key
        url[whitelistKey] === whitelistUrl[whitelistKey];
    });
  });
};
