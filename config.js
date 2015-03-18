var crypto = require('crypto'),
    envParser = require('./src/util/env-parser'),
    envConfig = require('./src/util/env-config'),
    RSVP = require('rsvp');

var config = {
    /**
     * enable/disable specific routes
     */
    ROUTES: {
        INDEX: true,
        // /convert/{profile}/{url}
        PROFILE_CONVERT: true
    },

    /**
     * reader options
     */
    READER: {
        REQUEST: {
            // http/https request timeout
            TIMEOUT: 10 * 1000
        }
    },

    /**
     * https://getsentry.com/welcome/ DSN (sentry logging is disabled if you don't set it)
     */
    SENTRY_DSN: undefined,

    /**
     * Enable to log gc and memory leaks using https://github.com/marcominetti/node-memwatch
     */
    MEMWATCH: false,

    /**
     * path to directory where more profiles are located
     */
    PROFILES_DIR: null,

    /**
     * server port
     */
    PORT: 3000,

    PREPROCESSOR: {
        VIDEO: {
            /**
             * kill ffmpeg after given amount of milliseconds. Use `-1` to disable.
             */
            KILL_TIMEOUT: 2 * 60 * 1000
        }
    },
    ACCESS: {
        /**
         * Array of local files and folders where the server has read access.
         */
        READ: [
            '/vagrant', '/tmp/flamingo'
        ],
        /**
         * Array of local files and folgers where the server has write access.
         */
        WRITE: [
            '/vagrant', '/tmp/flamingo'
        ]
    },
    // !!! CHANGE THIS IF YOU WANT TO USE IT !!!
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
    ENCODE_PAYLOAD: function (plaintext) {
        return new RSVP.Promise(function(resolve, reject){
            //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
            //    if (err) { reject(err); return; }
                try {
                    var read,
                        cipher = crypto.createCipheriv(config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV);
                    cipher.end(plaintext, 'utf8');

                    read = cipher.read();
                    if (read !== null) {
                        resolve(read.toString('utf8'));
                    } else {
                        reject('Cant\'t encode given plaintext');
                    }

                } catch(err) {
                    console.error(err);
                    reject(err);
                }
            //});
        });
    },
    /**
     * Function to decode a given base64 encoded string
     * @param {String} plaintext base64 encoded cipher text
     * @return {String} decoded String
     */
    DECODE_PAYLOAD: function (plaintext) {
        return new RSVP.Promise(function (resolve, reject) {
            //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
            //    if (err) { reject(err); return; }
                try {
                    var read,
                        decipher = crypto.createDecipheriv(config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV);

                    decipher.end(plaintext, 'base64');
                    read = decipher.read();

                    if (read !== null) {
                        resolve(read.toString('utf8'));
                    } else {
                        reject('Cant\'t decode given plaintext');
                    }
                } catch(err) {
                    console.error(err);
                    reject(err);
                }
            //})
        });
    }
};

// load base config from env
config = envConfig(config, process.env, [
    ['PORT', 'PORT', envParser.int(3000)],
    ['MEMWATCH', 'MEMWATCH', envParser.boolean],
    ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
    ['SENTRY_DSN', 'SENTRY_DSN'],
    ['ROUTE_CUSTOM_CONVERT', 'ROUTES.CUSTOM_CONVERT', envParser.boolean],
    ['ROUTE_PROFILE_CONVERT', 'ROUTES.PROFILE_CONVERT', envParser.boolean],
    ['ROUTE_INDEX', 'ROUTES.ROUTE_INDEX', envParser.boolean],
    ['ROUTE_S3', 'ROUTES.ROUTE_S3', envParser.boolean],

    ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
    ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
    ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer],

    ['PROFILES_DIR', 'PROFILES_DIR'],

    ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(10 * 1000)]
]);

module.exports = config;
