/**
 * Plaintext encipher/decipher module
 * @module
 */

import crypto = require("crypto");

import errors = require("./errors");

const { InvalidInputError } = errors;

/**
 * Function to decode a given base64 encoded string
 * @property {String} plaintext base64 encoded cipher text
 * @return {Promise.<String>} promise that resolves with plaintext
 * @example
 * decode(cipherText).then((plainText) => ...)
 */
function decode(
  ciphertext: string,
  algorithm: string,
  key: Buffer,
  iv: Buffer
): Promise<string | any> {
  return new Promise(function (resolve, reject) {
    //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.keyLEN, function (err, key) {
    //    if (err) { reject(err); return; }
    try {
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      decipher.on("error", function (err) {
        reject(new InvalidInputError("cipher.decode failed", err));
      });
      decipher.end(ciphertext, "base64");

      const read = decipher.read();

      if (read !== null) {
        resolve(read.toString("utf8"));
      } else {
        reject("Cant't decode given ciphertext");
      }
    } catch (err) {
      reject(err);
    }
    //})
  });
}

/**
 * Function to encode a given plaintext string
 * @private
 * @property {String} plaintext string to encode
 * @return {Promise.<String>} promise that resolves with the encoded payload
 * @example
 * encode(plaintext).then((cipherText) => ...)
 */
function encode(
  plaintext: string,
  algorithm: string,
  key: Buffer,
  iv: Buffer
): Promise<string | any> {
  return new Promise(function (resolve, reject) {
    //crypto.pbkdf2(config.CRYPTO.SECRET, config.CRYPTO.SALT, config.CRYPTO.ITERATIONS, config.CRYPTO.keyLEN, function (err, key) {
    //    if (err) { reject(err); return; }
    try {
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      cipher.on("error", function (err) {
        reject(new InvalidInputError("cipher.encode failed", err));
      });
      cipher.end(plaintext, "utf8");

      const read = cipher.read();

      if (read !== null) {
        resolve(read.toString("base64"));
      } else {
        reject("Cant't encode given plaintext");
      }
    } catch (err) {
      reject(err);
    }
    //});
  });
}

export = { decode, encode };
