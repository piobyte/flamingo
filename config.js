var crypto = require('crypto'),
    RSVP = require('rsvp');

var config = {
    /**
     * enable/disable specific routes
     */
    ROUTES: {
        INDEX: true,
        // /convert/{execution}
        CUSTOM_CONVERT: true,
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
                    var cipher = crypto.createCipheriv(config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV);
                    cipher.end(plaintext, 'utf8');
                } catch(err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(cipher.read().toString('base64'));
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
                    var decipher = crypto.createDecipheriv(config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV);
                    decipher.end(plaintext, 'base64');
                } catch(err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(decipher.read().toString('utf8'));
            //})
        });
    }
};

function parseIntNaN(value, nanDefault) {
    var parsed = parseInt(value, 10);
    if (isNaN(parsed)) { parsed = nanDefault; }
    return parsed;
}

// overwrite config with environment variables
if (process.env.PORT) { config.PORT = parseIntNaN(process.env.PORT, 3000); }

if (process.env.ROUTE_CUSTOM_CONVERT) { config.ROUTES.CUSTOM_CONVERT = process.env.ROUTE_CUSTOM_CONVERT === 'true'; }
if (process.env.ROUTE_PROFILE_CONVERT) { config.ROUTES.PROFILE_CONVERT = process.env.ROUTE_PROFILE_CONVERT === 'true'; }
if (process.env.ROUTE_INDEX) { config.ROUTES.INDEX = process.env.ROUTE_INDEX === 'true'; }

if (process.env.CRYPTO_IV) { config.CRYPTO.IV = new Buffer(process.env.CRYPTO_IV); }
if (process.env.CRYPTO_KEY) { config.CRYPTO.KEY = new Buffer(process.env.CRYPTO_KEY, 'base64'); }
if (process.env.CRYPTO_CIPHER) { config.CRYPTO.CIPHER = process.env.CRYPTO_CIPHER; }

if (process.env.PROFILES_DIR) { config.PROFILES_DIR = process.env.PROFILES_DIR; }

if (process.env.READER_REQUEST_TIMEOUT) { config.READER.REQUEST.TIMEOUT = parseIntNaN(process.env.READER_REQUEST_TIMEOUT, 10 * 1000); }


module.exports = config;
