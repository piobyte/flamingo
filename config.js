var crypto = require('crypto');

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
    // !!! CHANGE THIS SECRET IF YOU WANT TO USE IT !!!
    SECRET: 'oFvNpepj98JW4QJPoMYrFNpZ7aQ7AbzV',
    // !!! CHANGE THIS SECRET IF YOU WANT TO USE IT !!!

    CIPHER: 'BF-CBC' /* Blowfish */,
    /**
     * Function to encode a given plaintext string
     * @private
     * @param plaintext
     * @return {*}
     */
    ENCODE_PAYLOAD: function (plaintext) {
        var cipher = crypto.createCipher(config.CIPHER, config.SECRET);
        cipher.end(plaintext, 'utf8');
        return cipher.read().toString('base64');
    },
    /**
     * Function to decode a given base64 encoded string
     * @param {String} plaintext base64 encoded cipher text
     * @return {String} decoded String
     */
    DECODE_PAYLOAD: function (plaintext) {
        var decipher = crypto.createDecipher(config.CIPHER, config.SECRET);
        decipher.end(plaintext, 'base64');
        return decipher.read().toString('utf8');
    }
};

module.exports = config;
