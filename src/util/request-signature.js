const {InvalidInputError} = require('../util/errors');
const crypto = require('crypto');
const Promise = require('bluebird');

module.exports = function(op, givenDigest, enc) {
  const hmac = crypto.createHmac('sha256', op.config.CRYPTO.HMAC_KEY);

  hmac.update(`${enc}`);

  const digest = hmac.digest('hex');

  if (digest === givenDigest) {
    return Promise.resolve(op);
  } else {
    throw new InvalidInputError(`given hash (${givenDigest}) doesn't match expected hash (${digest})`);
  }
};
