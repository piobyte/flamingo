const {InvalidInputError} = require('../src/util/errors');
const crypto = require('crypto');
const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const qs = require('querystring');
const pickBy = require('lodash/pickBy');
const url = require('url');
const logger = require('../src/logger').build('tutorials/hmac-image-convert');
const merge = require('lodash/merge');

function hmacValidateOperation(operation, givenDigest, enc) {
  const hmac = crypto.createHmac('sha256', operation.config.CRYPTO.HMAC_KEY);

  hmac.update(`${enc}`);

  const digest = hmac.digest('hex');

  if (digest === givenDigest) {
    return Promise.resolve(operation);
  } else {
    throw new InvalidInputError(`given hash (${givenDigest}) doesn't match expected hash (${digest})`);
  }
}

function HmacImageConvert(superClass) {
  return class HmacImageConverter extends superClass {
    buildMessage(op) {
      const query = qs.stringify(op.request.query);
      const params = qs.stringify(pickBy(op.request.params, (val, key) => key !== 'signature'));

      return `${params}|${query}`;
    }

    extractDigest(op) {
      return op.request.params.signature;
    }

    validOperation(op) {
      return hmacValidateOperation(op, this.extractDigest(op), this.buildMessage(op));
    }

    extractInput(operation) {
      return Promise.resolve(url.parse(decodeURIComponent(operation.request.params.url)));
    }
  };
}

class HmacImageConvertRoute extends HmacImageConvert(Image) {
  constructor(conf, method = 'GET', path = '/image/{profile}/{signature}/{url}', description = 'Profile image conversion with additional hmac check') {
    super(conf, method, path, description);
  }
}

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig);
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new HmacImageConvertRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.hapi.info.uri}`) || server);
  });
