/**
 * Flamingo config module
 * @module flamingo/config
 */

var crypto = require('crypto'),
    envParser = require('./src/util/env-parser'),
    envConfig = require('./src/util/env-config'),
    RSVP = require('rsvp');

/**
 * @namespace CONFIG
 * @type {Object}
 */
var CONFIG = {
    /**
     * Enable some debug features, like host:port/debug for testing existing routes, configurations
     * @type {boolean}
     */
    DEBUG: false,

    /**
     * Default mimetype for default profile image conversion
     * @see https://en.wikipedia.org/wiki/Internet_media_type#Type_image
     * @type {String}
     */
    DEFAULT_MIME: 'image/png',

    /**
     * Enable native auto orient (requires graphicsmagick >= 1.3.18)
     * @type {boolean}
     */
    NATIVE_AUTO_ORIENT: true,

    /**
     * enable/disable specific routes
     * @type {object}
     * @param {boolean} INDEX if enabled, register [index route]{@link module:flamingo/routes/index}
     * @param {boolean} PROFILE_CONVERT if enabled, register [profile route]{@link module:flamingo/routes/profile}
     */
    ROUTES: {
        INDEX: true,
        PROFILE_CONVERT: true
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
     * @type {object}
     * @param {number} REQUEST.TIMEOUT default request timeout
     */
    READER: {
        REQUEST: {
            // http/https request timeout
            TIMEOUT: 10 * 1000
        }
    },

    /**
     * DSN (sentry logging is disabled if you don't set it)
     * @see  {@link https://getsentry.com/welcome/}
     * @type {string|undefined}
     */
    SENTRY_DSN: undefined,

    /**
     * server port
     * @type {number}
     */
    PORT: 3000,

    /**
     * preprocessor options
     * @type {object}
     * @param {number} VIDEO.KILL_TIMEOUT kill ffmpeg after given amount of milliseconds. Use `-1` to disable
     */
    PREPROCESSOR: {
        VIDEO: {
            KILL_TIMEOUT: 2 * 60 * 1000
        }
    },
    /**
     * access whitelists
     * @type {object}
     * @param {string[]} READ list of whitelisted read locations
     * @param {string[]} WRITE list of whitelisted write locations
     */
    ACCESS: {
        READ: [
            '/vagrant', '/tmp/flamingo'
        ],
        WRITE: [
            '/vagrant', '/tmp/flamingo'
        ]
    },
    /**
     * crypto settings (IF YOU WANT TO USE CRYPTO, CHANGE THE DEFAULT VALUES)
     * @type {object}
     * @param {buffer} KEY key buffer
     * @param {buffer} IV iv buffer
     * @param {string} CIPHER crypto cipher
     */
    CRYPTO: {
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
     */
    ENCODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
        return new RSVP.Promise(function(resolve, reject){
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

                } catch(err) {
                    reject(err);
                }
            //});
        });
    },
    /**
     * Function to decode a given base64 encoded string
     * @param {String} plaintext base64 encoded cipher text
     * @return {Promise} promise that resolves with plaintext
     */
    DECODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
        return new RSVP.Promise(function (resolve, reject) {
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

    ['PORT', 'PORT', envParser.int(3000)],
    ['DEBUG', 'DEBUG', envParser.boolean],
    ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
    ['SENTRY_DSN', 'SENTRY_DSN'],
    ['ROUTE_PROFILE_CONVERT', 'ROUTES.PROFILE_CONVERT', envParser.boolean],
    ['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],

    ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
    ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
    ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer],

    ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(10 * 1000)]
]);

module.exports = CONFIG;
