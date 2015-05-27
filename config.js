/**
 * Flamingo config module
 * @module flamingo/config
 */

var crypto = require('crypto'),
    envParser = require('./src/util/env-parser'),
    envConfig = require('./src/util/env-config'),
    RSVP = require('rsvp');

var Promise = RSVP.Promise;

/**
 * @namespace CONFIG
 * @type {Object}
 */
var CONFIG = {
    /**
     * Enable some debug features, like host:port/debug for testing existing routes, configurations.
     * @see Environment: 'DEBUG'
     * @type {boolean}
     */
    DEBUG: false,

    /**
     * Default mimetype for default profile image conversion
     * @see https://en.wikipedia.org/wiki/Internet_media_type#Type_image
     * @see Environment: 'DEFAULT_MIME'
     * @type {String}
     */
    DEFAULT_MIME: 'image/png',

    /**
     * Enable native auto orient (requires graphicsmagick >= 1.3.18)
     * @see Environment: 'NATIVE_AUTO_ORIENT'
     * @type {boolean}
     */
    NATIVE_AUTO_ORIENT: true,

    /**
     * Enable to allow reader redirects. (Useful against SSRF redirects)
     * @see Environment: 'ALLOW_READ_REDIRECT'
     * @see SSRF bible
     * @type {boolean}
     */
    ALLOW_READ_REDIRECT: false,

    /**
     * enable/disable specific routes
     * @see Environment: 'ROUTE_INDEX', 'ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTE_PROFILE_CONVERT_VIDEO'
     * @type {object}
     * @param {boolean} [INDEX=true] if enabled, register [index route]{@link module:flamingo/routes/index}
     * @param {boolean} [PROFILE_CONVERT_IMAGE=true] if enabled, register [profile route]{@link module:flamingo/routes/profile}
     * @param {boolean} [PROFILE_CONVERT_VIDEO=true] if enabled, register [profile route]{@link module:flamingo/routes/profile}
     */
    ROUTES: {
        INDEX: true,
        PROFILE_CONVERT_IMAGE: true,
        PROFILE_CONVERT_VIDEO: true
    },

    /**
     * Object containing flags for supported features. These fields will be overwritting after starting flamingo.
     * @type {object}
     * @param {boolean} GM.WEBP if true, gm supports converting to webp
     */
    SUPPORTED: {
        GM: {
            WEBP: false
        }
    },

    /**
     * reader options
     * @see Environment: 'READER_REQUEST_TIMEOUT'
     * @type {object}
     * @param {number} [REQUEST.TIMEOUT=10000] default request timeout
     */
    READER: {
        REQUEST: {
            // http/https request timeout
            TIMEOUT: 10 * 1000
        }
    },

    /**
     * DSN (sentry logging is disabled if you don't set it)
     * @see Environment: 'SENTRY_DSN'
     * @see  {@link https://getsentry.com/welcome/}
     * @type {string|undefined}
     */
    SENTRY_DSN: undefined,

    /**
     * server port
     * @see Environment: 'PORT'
     * @type {number}
     */
    PORT: 3000,

    /**
     * preprocessor options
     * @type {object}
     * @param {number} [VIDEO.KILL_TIMEOUT=120000] kill ffmpeg after given amount of milliseconds. Use `-1` to disable
     */
    PREPROCESSOR: {
        VIDEO: {
            KILL_TIMEOUT: 2 * 60 * 1000
        }
    },
    /**
     * access whitelist
     * @type {object}
     * @param {boolean} HTTPS.ENABLED if true, enables the https reader whitelist filter (will be set to true by default in the next release)
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
    ACCESS: {
        FILE: {
            READ: [],
            WRITE: []
        },
        HTTPS: {
            ENABLED: false,
            READ: [],
            WRITE: []
        }
    },
    /**
     * crypto settings (IF YOU WANT TO USE CRYPTO, CHANGE THE DEFAULT VALUES)
     * @type {object}
     * @see Environment: 'CRYPTO_ENABLED', 'CRYPTO_IV', 'CRYPTO_KEY', 'CRYPTO_CIPHER'
     * @param {boolean} [ENABLED=true] whether the url should be decrypted
     * @param {buffer} KEY key buffer
     * @param {buffer} IV iv buffer
     * @param {string} [CIPHER=BF-CBC] crypto cipher
     */
    CRYPTO: {
        ENABLED: true,
        KEY: new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64'),
        IV: new Buffer('_ag3WU77'),
        CIPHER: 'BF-CBC' /* Blowfish */
        // pbkdf2 values to generate the above KEY, IV, CIPHER
        //SECRET: 'XwckHV-3cySkr96QbqhHb2GvianU3ggU',
        //SALT: 'URAdgv-D',
        //ITERATIONS: 2048,
        //KEYLEN: 16,
    },
    /**
     * Function to encode a given plaintext string
     * @private
     * @param {String} plaintext string to encode
     * @return {String} base64 encoded ciphertext
     * @return {Promise} promise that resolves with the encoded payload
     */
    ENCODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
        return !CONFIG.CRYPTO.ENABLED ? RSVP.resolve(new Buffer(plaintext).toString('base64')) : new Promise(function (resolve, reject) {
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
    },
    /**
     * Function to decode a given base64 encoded string
     * @param {String} plaintext base64 encoded cipher text
     * @return {Promise} promise that resolves with plaintext
     * @example
     * DECODE_PAYLOAD('foo').then((cipherText) => ...)
     */
    DECODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
        return !CONFIG.CRYPTO.ENABLED ? RSVP.resolve(new Buffer(plaintext, 'base64').toString('utf8')) : new Promise(function (resolve, reject) {
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
                } catch(err) {
                    reject(err);
                }
            //})
        });
    }
};

// load base config from env
CONFIG = envConfig(CONFIG, process.env, [
    ['DEBUG', 'DEBUG', envParser.boolean],
    ['DEFAULT_MIME', 'DEFAULT_MIME'],
    ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
    ['ALLOW_READ_REDIRECT', 'ALLOW_READ_REDIRECT', envParser.boolean],

    ['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],
    ['ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTES.PROFILE_CONVERT_IMAGE', envParser.boolean],
    ['ROUTE_PROFILE_CONVERT_VIDEO', 'ROUTES.PROFILE_CONVERT_VIDEO', envParser.boolean],

    ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(10 * 1000)],

    ['SENTRY_DSN', 'SENTRY_DSN'],
    ['PORT', 'PORT', envParser.int(3000)],

    ['CRYPTO_ENABLED', 'CRYPTO.ENABLED', envParser.boolean],
    ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
    ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
    ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer]
]);

module.exports = CONFIG;
