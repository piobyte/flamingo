/**
 * Flamingo config module
 * @module flamingo/config
 */

var crypto = require('crypto'),
  envParser = require('./src/util/env-parser'),
  envConfig = require('./src/util/env-config'),
  pkg = require('./package.json'),
  RSVP = require('rsvp');

var MAPPINGS = [];
/**
 * @namespace CONFIG
 * @type {Object}
 */
var CONFIG = {};
/**
 * Enables some debug features.
 *
 * If `DEBUG` is true, the [debug route]{@link module:flamingo/src/routes/debug} will be registered.
 * @see Environment: 'DEBUG'
 * @default false
 * @type {boolean}
 */
CONFIG.DEBUG = false;
MAPPINGS.push(['DEBUG', 'DEBUG', envParser.boolean]);

/**
 * Default mimetype for default profile image conversion
 * @see https://en.wikipedia.org/wiki/Internet_media_type#Type_image
 * @see Environment: 'DEFAULT_MIME'
 * @type {String}
 * @default image/png
 */
CONFIG.DEFAULT_MIME = 'image/png';
MAPPINGS.push(['DEFAULT_MIME', 'DEFAULT_MIME']);

/**
 * Enable native auto orient (requires graphicsmagick >= 1.3.18)
 * @see Environment: 'NATIVE_AUTO_ORIENT'
 * @default true
 * @type {boolean}
 */
CONFIG.NATIVE_AUTO_ORIENT = true;
MAPPINGS.push(['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean]);

/**
 * Enable to allow reader redirects. (Useful against SSRF redirects)
 * @see Environment: 'ALLOW_READ_REDIRECT'
 * @see SSRF bible
 * @default false
 * @type {boolean}
 */
CONFIG.ALLOW_READ_REDIRECT = false;
MAPPINGS.push(['ALLOW_READ_REDIRECT', 'ALLOW_READ_REDIRECT', envParser.boolean]);

/**
 * enable/disable specific routes
 * @see Environment: 'ROUTE_INDEX', 'ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTE_PROFILE_CONVERT_VIDEO'
 * @type {object}
 * @param {boolean} [INDEX=true] if enabled, register [index route]{@link module:flamingo/src/routes/index}
 * @param {boolean} [PROFILE_CONVERT_IMAGE=true] if enabled, register [image convert route]{@link module:flamingo/src/routes/convert/image}
 * @param {boolean} [PROFILE_CONVERT_VIDEO=true] if enabled, register [video convert route]{@link module:flamingo/src/routes/convert/video}
 */
CONFIG.ROUTES = {
  INDEX: true,
  PROFILE_CONVERT_IMAGE: true,
  PROFILE_CONVERT_VIDEO: true
};

MAPPINGS.push(['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTES.PROFILE_CONVERT_IMAGE', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_VIDEO', 'ROUTES.PROFILE_CONVERT_VIDEO', envParser.boolean]);

/**
 * Object containing flags for supported features. These fields will be overwritting after starting flamingo.
 * @type {object}
 * @param {boolean} [GM.WEBP=false] if true, gm supports converting to webp
 */
CONFIG.SUPPORTED = {
  GM: {
    WEBP: false
  }
};

/**
 * reader options
 * @see Environment: 'READER_REQUEST_TIMEOUT'
 * @type {object}
 * @param {number} [REQUEST.TIMEOUT=10000] default request timeout
 */
CONFIG.READER = {
  REQUEST: {
    // http/https request timeout
    TIMEOUT: 10 * 1000
  }
};
MAPPINGS.push(['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(CONFIG.READER.REQUEST.TIMEOUT)]);

/**
 * server port
 * @see Environment: 'PORT'
 * @default 3000
 * @type {number}
 */
CONFIG.PORT = 3000;
MAPPINGS.push(['PORT', 'PORT', envParser.int(CONFIG.PORT)]);

/**
 * preprocessor options
 * @type {object}
 * @param {number} [VIDEO.KILL_TIMEOUT=120000] kill ffmpeg after given amount of milliseconds. Use `-1` to disable
 */
CONFIG.PREPROCESSOR = {
  VIDEO: {
    KILL_TIMEOUT: 2 * 60 * 1000
  }
};
MAPPINGS.push(['PREPROCESSOR_VIDEO_KILL_TIMEOUT', 'PREPROCESSOR.VIDEO.KILL_TIMEOUT', envParser.int(CONFIG.PREPROCESSOR.VIDEO.KILL_TIMEOUT)]);

/**
 * access whitelist
 * @type {object}
 * @param {boolean} [HTTPS.ENABLED=false] if true, enables the https reader whitelist filter (will be set to true by default in the next release)
 * @param {object[]} HTTPS.READ array containing objects with fields that have to be on the parsed url to be a valid read url
 * @param {object[]} HTTPS.WRITE array containing objects with fields that have to be on the parsed url to be a valid write url
 * @param {string[]} FILE.READ list of whitelisted read locations
 * @param {string[]} FILE.WRITE list of whitelisted write locations
 * @see https://iojs.org/api/url.html#url_url_format_urlobj
 * @example
 * ACCESS: {
     *  FILE: {
     *      READ: ['/tmp'] // only allow file input from `/tmp`
     *  }
     *  HTTPS: {
     *      READ: [{protocol: 'https:'}] // only allow https input urls
     *  }
     * }
 */
CONFIG.ACCESS = {};
CONFIG.ACCESS.FILE = {
  READ: [],
  WRITE: []
};
MAPPINGS.push(['ACCESS_FILE_READ', 'ACCESS.FILE.READ', JSON.parse]);
MAPPINGS.push(['ACCESS_FILE_WRITE', 'ACCESS.FILE.WRITE', JSON.parse]);

CONFIG.ACCESS.HTTPS = {
  ENABLED: false,
  READ: [],
  WRITE: []
};
MAPPINGS.push(['ACCESS_HTTPS_ENABLED', 'ACCESS.HTTPS.ENABLED', envParser.boolean]);
MAPPINGS.push(['ACCESS_HTTPS_READ', 'ACCESS.HTTPS.READ', JSON.parse]);
MAPPINGS.push(['ACCESS_HTTPS_WRITE', 'ACCESS.HTTPS.READ', JSON.parse]);

/**
 * crypto settings (IF YOU WANT TO USE CRYPTO, CHANGE THE DEFAULT VALUES)
 * @type {object}
 * @see Environment: 'CRYPTO_ENABLED', 'CRYPTO_IV', 'CRYPTO_KEY', 'CRYPTO_CIPHER'
 * @param {boolean} [ENABLED=true] whether the url should be decrypted
 * @param {buffer} [KEY=new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64')] key buffer
 * @param {buffer} [IV=new Buffer('_ag3WU77')] iv buffer
 * @param {string} [CIPHER=BF-CBC] crypto cipher
 */
CONFIG.CRYPTO = {
  ENABLED: true,
  KEY: new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64'),
  IV: new Buffer('_ag3WU77'),
  CIPHER: 'BF-CBC' /* Blowfish */
  // pbkdf2 values to generate the above KEY, IV, CIPHER
  //SECRET: 'XwckHV-3cySkr96QbqhHb2GvianU3ggU',
  //SALT: 'URAdgv-D',
  //ITERATIONS: 2048,
  //KEYLEN: 16,
};
MAPPINGS.push(['CRYPTO_ENABLED', 'CRYPTO.ENABLED', envParser.boolean],
  ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
  ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
  ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer]);

/**
 * Function to encode a given plaintext string
 * @private
 * @param {String} plaintext string to encode
 * @return {String} base64 encoded ciphertext
 * @return {Promise} promise that resolves with the encoded payload
 */
CONFIG.ENCODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
  return !CONFIG.CRYPTO.ENABLED ?
    RSVP.resolve(new Buffer(plaintext).toString('base64')) :
    new RSVP.Promise(function (resolve, reject) {
      //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
      //    if (err) { reject(err); return; }
      try {
        var read,
          cipher = crypto.createCipheriv(CONFIG.CRYPTO.CIPHER, CONFIG.CRYPTO.KEY, CONFIG.CRYPTO.IV);

        cipher.end(plaintext, 'utf8');
        read = cipher.read();

        if (read !== null) {
          resolve(read.toString('base64'));
        } else {
          reject('Cant\'t encode given plaintext');
        }
      } catch (err) {
        reject(err);
      }
      //});
    });
};
/**
 * Function to decode a given base64 encoded string
 * @param {String} plaintext base64 encoded cipher text
 * @return {Promise} promise that resolves with plaintext
 * @example
 * DECODE_PAYLOAD('foo').then((cipherText) => ...)
 */
CONFIG.DECODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
  return !CONFIG.CRYPTO.ENABLED ?
    RSVP.resolve(new Buffer(plaintext, 'base64').toString('utf8')) :
    new RSVP.Promise(function (resolve, reject) {
      //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
      //    if (err) { reject(err); return; }
      try {
        var read,
          decipher = crypto.createDecipheriv(CONFIG.CRYPTO.CIPHER, CONFIG.CRYPTO.KEY, CONFIG.CRYPTO.IV);

        decipher.end(plaintext, 'base64');
        read = decipher.read();

        if (read !== null) {
          resolve(read.toString('utf8'));
        } else {
          reject('Cant\'t decode given plaintext');
        }
      } catch (err) {
        reject(err);
      }
      //})
    });
};

// load base config from env
CONFIG = envConfig(CONFIG, process.env, MAPPINGS);

CONFIG.VERSION = pkg.version;
module.exports = CONFIG;
