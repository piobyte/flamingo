'use strict';

const supported = require('./src/util/supported');
const {InvalidInputError} = require('./src/util/errors');
const crypto = require('crypto');
const Promise = require('bluebird');
const envParser = require('./src/util/env-parser');
const envConfig = require('./src/util/env-config');
const pkg = require('./package');

/**
 * Default {@link Config} values
 */
const DEFAULTS = {};

/**
 *
 * @type {number}
 * @default 3000
 */
DEFAULTS.PORT = 3000;

/**
 * @type {boolean}
 * @default false
 */
DEFAULTS.DEBUG = false;

/**
 * @default 'image/png'
 * @type {string}
 */
DEFAULTS.DEFAULT_MIME = 'image/png';

/**
 * @default true
 * @type {boolean}
 */
DEFAULTS.NATIVE_AUTO_ORIENT = true;

/**
 * @default false
 * @type {boolean}
 */
DEFAULTS.ALLOW_READ_REDIRECT = false;

/**
 * @default false
 * @type {boolean}
 */
DEFAULTS.CLIENT_HINTS = false;

/**
 * @readonly
 * @type {string}
 */
DEFAULTS.VERSION = pkg.version;

/**
 * crypto settings (IF YOU WANT TO USE CRYPTO, CHANGE THE DEFAULT VALUES)
 * @type {object}
 * @property {boolean} [ENABLED=true] whether the url should be decrypted
 * @property {buffer} [KEY=new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64')] key buffer
 * @property {buffer} [IV=new Buffer('_ag3WU77')] iv buffer
 * @property {string} [CIPHER=BF-CBC] crypto cipher
 */
DEFAULTS.CRYPTO = {
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
};

/**
 * preprocessor options
 * @type {object}
 * @property {number} [VIDEO.KILL_TIMEOUT=120000] kill ffmpeg after given amount of milliseconds. Use `-1` to disable
 */
DEFAULTS.PREPROCESSOR = {
  VIDEO: {
    KILL_TIMEOUT: 2 * 60 * 1000
  }
};
DEFAULTS.ACCESS = {
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

/**
 * enable/disable specific routes
 * @type {object}
 * @property {boolean} [INDEX=true] if enabled, register [index route]{@link module:flamingo/src/routes/index}
 * @property {boolean} [PROFILE_CONVERT_IMAGE=true] if enabled, register [image convert route]{@link module:flamingo/src/routes/convert/image}
 * @property {boolean} [PROFILE_CONVERT_VIDEO=true] if enabled, register [video convert route]{@link module:flamingo/src/routes/convert/video}
 */
DEFAULTS.ROUTES = {
  INDEX: true,
  PROFILE_CONVERT_IMAGE: true,
  PROFILE_CONVERT_VIDEO: true
};
/**
 * Object containing flags for supported features. These fields will be overwritting after starting flamingo.
 * @type {object}
 * @property {boolean} [GM.FFMPEG=false] if true, ffmpeg is available
 */
DEFAULTS.SUPPORTED = {
  FFMPEG: true
};

/**
 * reader options
 * @type {object}
 * @property {number} [REQUEST.TIMEOUT=10000] default request timeout
 */
DEFAULTS.READER = {
  REQUEST: {
    // http/https request timeout
    TIMEOUT: 10 * 1000
  }
};

/**
 * Function to encode a given plaintext string
 * @private
 * @property {String} plaintext string to encode
 * @return {Promise.<String>} promise that resolves with the encoded payload
 */
DEFAULTS.ENCODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
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
};

/**
 * Function to decode a given base64 encoded string
 * @property {String} plaintext base64 encoded cipher text
 * @return {Promise.<String>} promise that resolves with plaintext
 * @example
 * DECODE_PAYLOAD('foo').then((cipherText) => ...)
 */
DEFAULTS.DECODE_PAYLOAD = /* istanbul ignore next */ function (plaintext) {
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
