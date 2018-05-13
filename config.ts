/**
 * Config module
 * @module
 */

import supported = require('./src/util/supported');
import envParser = require('./src/util/env-parser');
import envConfig = require('./src/util/env-config');
import Mapping from './src/types/Mapping';
const pkg = require('./package.json');

class Config {
  [name: string]: any;
  PORT?: number = 3000;
  HOST?: string = undefined;
  DEBUG?: boolean = false;
  DEFAULT_MIME?: string = 'image/png';
  NATIVE_AUTO_ORIENT?: boolean = true;
  ALLOW_READ_REDIRECT?: boolean = false;
  CLIENT_HINTS?: boolean = false;
  VERSION?: string = pkg.version;
  CRYPTO?: {
    ENABLED: boolean,
    KEY: Buffer,
    IV: Buffer,
    HMAC_KEY: string,
    CIPHER: 'BF-CBC' | string,
  } = {
    ENABLED: true,
    KEY: new Buffer('DjiZ7AWTeNh38zoQiZ76gw::', 'base64'),
    IV: new Buffer('_ag3WU77'),
    HMAC_KEY: 'NLoTxj5d2ts2z5xPREtGUJZC9tCCQFAX',
    CIPHER: 'BF-CBC', /* Blowfish */
    // pbkdf2 values to generate the above KEY, IV, CIPHER
    //SECRET: 'XwckHV-3cySkr96QbqhHb2GvianU3ggU',
    //SALT: 'URAdgv-D',
    //ITERATIONS: 2048,
    //KEYLEN: 16,
  };
  PREPROCESSOR?: {
    VIDEO: {
      KILL_TIMEOUT: number,
    },
  } = {
    VIDEO: {
      KILL_TIMEOUT: 2 * 60 * 1000,
    },
  };
  ACCESS?: {
    FILE?: {
      READ?: Array<string>,
      WRITE?: Array<string>,
    },
    HTTPS?: {
      ENABLED?: boolean,
      READ?: Array<{ [key: string]: string }>,
      WRITE?: Array<{ [key: string]: string }>,
    },
  } = {
    FILE: {
      READ: [],
      WRITE: [],
    },
    HTTPS: {
      ENABLED: false,
      READ: [],
      WRITE: [],
    },
  };
  ROUTES?: {
    INDEX?: boolean,
    PROFILE_CONVERT_IMAGE?: boolean,
    PROFILE_CONVERT_VIDEO?: boolean,
  } = {
    INDEX: true,
    PROFILE_CONVERT_IMAGE: true,
    PROFILE_CONVERT_VIDEO: true,
  };
  SUPPORTED?: {
    FFMPEG?: boolean,
  } = {
    FFMPEG: true,
  };
  READER?: {
    REQUEST?: {
      // http/https request timeout
      TIMEOUT?: number,
    },
  } = {
    REQUEST: {
      // http/https request timeout
      TIMEOUT: 10 * 1000,
    },
  };

  /**
   * Create and initialize a config instance process environment variables
   * @static
   * @param {object} env given process environment
   * @param {Array} mappings environment mappings{@link flamingo/src/util/env-config}
   * @returns {Promise.<Config>} initialized config instance
   */
  static fromEnv (env = process.env, mappings: Array<Mapping> = ENV_MAPPINGS): Promise<Config> {
    const config = new Config();
    const parsedEnvConfig = envConfig(config, env, mappings);

    // update config with new values
    Object.keys(parsedEnvConfig).forEach((key) =>
      config[key] = parsedEnvConfig[key]);

    return addSupported(config);
  }
}

const ENV_MAPPINGS: Array<Mapping> = [
  ['DEBUG', 'DEBUG', envParser.boolean],
  ['DEFAULT_MIME', 'DEFAULT_MIME'],
  ['HOST', 'HOST'],
  ['NATIVE_AUTO_ORIENT', 'NATIVE_AUTO_ORIENT', envParser.boolean],
  ['ALLOW_READ_REDIRECT', 'ALLOW_READ_REDIRECT', envParser.boolean],
  ['CLIENT_HINTS', 'CLIENT_HINTS', envParser.boolean],
  ['ROUTE_INDEX', 'ROUTES.INDEX', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_IMAGE', 'ROUTES.PROFILE_CONVERT_IMAGE', envParser.boolean],
  ['ROUTE_PROFILE_CONVERT_VIDEO', 'ROUTES.PROFILE_CONVERT_VIDEO', envParser.boolean],
  ['READER_REQUEST_TIMEOUT', 'READER.REQUEST.TIMEOUT', envParser.int(10 * 1000)],
  ['PORT', 'PORT', envParser.int(3000)],
  ['PREPROCESSOR_VIDEO_KILL_TIMEOUT', 'PREPROCESSOR.VIDEO.KILL_TIMEOUT', envParser.int(2 * 60 * 1000)],
  ['ACCESS_FILE_READ', 'ACCESS.FILE.READ', JSON.parse],
  ['ACCESS_FILE_WRITE', 'ACCESS.FILE.WRITE', JSON.parse],
  ['ACCESS_HTTPS_ENABLED', 'ACCESS.HTTPS.ENABLED', envParser.boolean],
  ['ACCESS_HTTPS_READ', 'ACCESS.HTTPS.READ', JSON.parse],
  ['ACCESS_HTTPS_WRITE', 'ACCESS.HTTPS.WRITE', JSON.parse],
  ['CRYPTO_ENABLED', 'CRYPTO.ENABLED', envParser.boolean],
  ['CRYPTO_IV', 'CRYPTO.IV', envParser.buffer],
  ['CRYPTO_KEY', 'CRYPTO.KEY', envParser.buffer64],
  ['CRYPTO_CIPHER', 'CRYPTO.CIPHER', envParser.buffer],
  ['CRYPTO_HMAC_KEY', 'CRYPTO.HMAC_KEY'],
];

function addSupported (config): Promise<Config> {
  return supported(config)
    .then((SUPPORTED) => config.SUPPORTED = SUPPORTED)
    .then(() => config);
}

/**
 * Configuration class that holds various configuration fields
 * @class
 */

export = Config;
