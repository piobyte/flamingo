'use strict';

/**
 * Flamingo config module
 * @module flamingo/config
 */

const supported = require('./src/util/supported');
const errors = require('./src/util/errors');
const crypto = require('crypto');
const Promise = require('bluebird');
const envParser = require('./src/util/env-parser');
const envConfig = require('./src/util/env-config');
const pkg = require('./package');

class Config {
  constructor() {
    // setup default values
    this.PORT = 3000;
    this.DEBUG = false;
    this.DEFAULT_MIME = 'image/png';
    this.NATIVE_AUTO_ORIENT = true;
    this.ALLOW_READ_REDIRECT = false;
    this.CLIENT_HINTS = false;
    this.VERSION = pkg.version;
    this.CRYPTO = {
      ENABLED: true,
      KEY: new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64'),
      IV: new Buffer('_ag3WU77'),
      HMAC_KEY: 'NLoTxj5d2ts2z5xPREtGUJZC9tCCQFAX',
      CIPHER: 'BF-CBC' /* Blowfish */
      // pbkdf2 values to generate the above KEY, IV, CIPHER
      //SECRET: 'XwckHV-3cySkr96QbqhHb2GvianU3ggU',
      //SALT: 'URAdgv-D',
      //ITERATIONS: 2048,
      //KEYLEN: 16,
    };
    this.PREPROCESSOR = {
      VIDEO: {
        KILL_TIMEOUT: 2 * 60 * 1000
      }
    };
    this.ACCESS = {
      FILE: {
        READ: [],
        WRITE: []
      },
      HTTPS: {
        ENABLED: false,
        READ: [],
        WRITE: []
      }
    };
    this.ROUTES = {
      INDEX: true,
      PROFILE_CONVERT_IMAGE: true,
      PROFILE_CONVERT_VIDEO: true
    };
    this.SUPPORTED = {
      FFMPEG: true,
      GM: {
        WEBP: false
      }
    };
    this.READER = {
      REQUEST: {
        // http/https request timeout
        TIMEOUT: 10 * 1000
      }
    };
    this.MAPPINGS = [
      ['DEBUG', 'DEBUG', envParser.boolean],
      ['DEFAULT_MIME', 'DEFAULT_MIME'],
      ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
      ['ALLOW_READ_REDIRECT', 'ALLOW_READ_REDIRECT', envParser.boolean],
      ['CLIENT_HINTS', 'CLIENT_HINTS', envParser.boolean],
      ['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],
      ['ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTES.PROFILE_CONVERT_IMAGE', envParser.boolean],
      ['ROUTE_PROFILE_CONVERT_VIDEO', 'ROUTES.PROFILE_CONVERT_VIDEO', envParser.boolean],
      ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(this.READER.REQUEST.TIMEOUT)],
      ['PORT', 'PORT', envParser.int(this.PORT)],
      ['PREPROCESSOR_VIDEO_KILL_TIMEOUT', 'PREPROCESSOR.VIDEO.KILL_TIMEOUT', envParser.int(this.PREPROCESSOR.VIDEO.KILL_TIMEOUT)],
      ['ACCESS_FILE_READ', 'ACCESS.FILE.READ', JSON.parse],
      ['ACCESS_FILE_WRITE', 'ACCESS.FILE.WRITE', JSON.parse],
      ['ACCESS_HTTPS_ENABLED', 'ACCESS.HTTPS.ENABLED', envParser.boolean],
      ['ACCESS_HTTPS_READ', 'ACCESS.HTTPS.READ', JSON.parse],
      ['ACCESS_HTTPS_WRITE', 'ACCESS.HTTPS.WRITE', JSON.parse],
      ['CRYPTO_ENABLED', 'CRYPTO.ENABLED', envParser.boolean],
      ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
      ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
      ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer],
      ['CRYPTO_HMAC_KEY', 'CRYPTO.HMAC_KEY']
    ];
  }

  /**
   * Initializes config with process environment variables
   * @param env
   * @returns {Config}
   */
  fromEnv(env = process.env) {
    const CONFIG = envConfig(this, env, this.MAPPINGS);
    // update this with new values
    Object.keys(CONFIG).forEach(key => {
      this[key] = CONFIG[key];
    });

    this.ENCODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
      const ENABLED = this.CRYPTO.ENABLED;
      const CIPHER = this.CRYPTO.CIPHER;
      const KEY = this.CRYPTO.KEY;
      const IV = this.CRYPTO.IV;

      return !ENABLED ?
        Promise.resolve(new Buffer(plaintext).toString('base64')) :
        new Promise(function (resolve, reject) {
          //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
          //    if (err) { reject(err); return; }
          try {
            let read;
            const cipher = crypto.createCipheriv(CIPHER, KEY, IV);

            cipher.on('error', function (err) {
              reject(new errors.InvalidInputError('cipher failed', err));
            });
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
    this.DECODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
      const ENABLED = this.CRYPTO.ENABLED;
      const CIPHER = this.CRYPTO.CIPHER;
      const KEY = this.CRYPTO.KEY;
      const IV = this.CRYPTO.IV;

      return !ENABLED ?
        Promise.resolve(new Buffer(plaintext, 'base64').toString('utf8')) :
        new Promise(function (resolve, reject) {
          //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.KEYLEN, function (err, key) {
          //    if (err) { reject(err); return; }
          try {
            let read;
            const decipher = crypto.createDecipheriv(CIPHER, KEY, IV);

            decipher.on('error', function (err) {
              reject(new errors.InvalidInputError('decipher failed', err));
            });
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

    return supported(this).then((SUPPORTED) => {
      this.SUPPORTED = SUPPORTED;
      return this;
    });
  }
}

module.exports = Config;
