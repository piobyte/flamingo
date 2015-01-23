var crypto = require('crypto'),
    RSVP = require('rsvp');

const config = {
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
     * path to directory where more profiles are located
     */
    PROFILES: {
        // directories that contain multiple profile files. These only return one profile function.
        DIR: null,
        // file that returns multiple one object containing multiple profile functions.
        FILE: null
    },

    /**
     * server port
     */
    PORT: 3000,

    /**
     * configure request rate limiting
     */
    RATE_LIMIT: {
        ALL: {
            // 50 requests per minute
            REQUESTS: 50,
            TIME: 'minute',
            WAIT_FOR_TOKEN: false
        }
    },
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
     * @param plaintext
     * @return {*}
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
        })
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

module.exports = config;
