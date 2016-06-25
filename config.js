'use strict';

const supported = require('./src/util/supported');
const {InvalidInputError} = require('./src/util/errors');
const crypto = require('crypto');
const Promise = require('bluebird');
const envParser = require('./src/util/env-parser');
const envConfig = require('./src/util/env-config');
const pkg = require('./package');

const DEFAULTS = {
  PORT: 3000,
  DEBUG: false,
  DEFAULT_MIME: 'image/png',
  NATIVE_AUTO_ORIENT: true,
  ALLOW_READ_REDIRECT: false,
  CLIENT_HINTS: false,
  VERSION: pkg.version,
  CRYPTO: {
    ENABLED: true,
    KEY: new Buffer('DjiZ7AWTeNh38zoQiZ76gw::', 'base64'),
    IV: new Buffer('_ag3WU77'),
    HMAC_KEY: 'NLoTxj5d2ts2z5xPREtGUJZC9tCCQFAX',
    CIPHER: 'BF-CBC' /* Blowfish */
    // pbkdf2 values to generate the above KEY, IV, CIPHER
    //SECRET: 'XwckHV-3cySkr96QbqhHb2GvianU3ggU',
    //SALT: 'URAdgv-D',
    //ITERATIONS: 2048,
    //KEYLEN: 16,
  },
  PREPROCESSOR: {
    VIDEO: {
      KILL_TIMEOUT: 2 * 60 * 1000
    }
  },
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
  ROUTES: {
    INDEX: true,
    PROFILE_CONVERT_IMAGE: true,
    PROFILE_CONVERT_VIDEO: true
  },
  SUPPORTED: {
    FFMPEG: true,
    GM: {
      WEBP: false
    }
  },
  READER: {
    REQUEST: {
      // http/https request timeout
      TIMEOUT: 10 * 1000
    }
  },
  ENCODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
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
            reject(new InvalidInputError('ENCODE_PAYLOAD failed', err));
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
  },
  DECODE_PAYLOAD: /* istanbul ignore next */ function (plaintext) {
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
            reject(new InvalidInputError('DECODE_PAYLOAD failed', err));
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
  }
};

const ENV_MAPPINGS = [
  ['DEBUG', 'DEBUG', envParser.boolean],
  ['DEFAULT_MIME', 'DEFAULT_MIME'],
  ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
  ['ALLOW_READ_REDIRECT', 'ALLOW_READ_REDIRECT', envParser.boolean],
  ['CLIENT_HINTS', 'CLIENT_HINTS', envParser.boolean],
  ['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTES.PROFILE_CONVERT_IMAGE', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_VIDEO', 'ROUTES.PROFILE_CONVERT_VIDEO', envParser.boolean],
  ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(DEFAULTS.READER.REQUEST.TIMEOUT)],
  ['PORT', 'PORT', envParser.int(DEFAULTS.PORT)],
  ['PREPROCESSOR_VIDEO_KILL_TIMEOUT', 'PREPROCESSOR.VIDEO.KILL_TIMEOUT', envParser.int(DEFAULTS.PREPROCESSOR.VIDEO.KILL_TIMEOUT)],
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

function addSupported(config) {
  return supported(config)
    .then(SUPPORTED => config.SUPPORTED = SUPPORTED)
    .then(() => config);
}

/**
 * Configuration class that holds various configuration fields
 * @class
 */
class Config {
  constructor() {
    // setup default values
    Object.keys(DEFAULTS)
      .forEach(key => this[key] = DEFAULTS[key]);
  }

  /**
   * Create and initialize a config instance process environment variables
   * @static
   * @param {object} env given process environment
   * @param {Array} mappings environment mappings{@link flamingo/src/util/env-config}
   * @returns {Promise.<Config>} initialized config instance
   */
  static fromEnv(env = process.env, mappings = ENV_MAPPINGS) {
    const config = new Config();
    const parsedEnvConfig = envConfig(config, env, mappings);

    // update config with new values
    Object.keys(parsedEnvConfig).forEach(key =>
      config[key] = parsedEnvConfig[key]);

    return addSupported(config);
  }
}

exports.ENV_MAPPINGS = ENV_MAPPINGS;
module.exports = Config;
