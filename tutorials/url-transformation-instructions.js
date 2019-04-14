const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const merge = require('lodash/merge');
const logger = require('../src/logger').build('tutorials/url-transformation-instructions');

function operationToProcess(operation) {
  const processes = operation.request.params.transforms.split(';');
  return Promise.resolve({
    response: {},
    process: processes.map(processString => {
      const ops = processString.split(',').map(operation => {
        const operationSplit = operation.split('=');
        const args = operationSplit.slice(1).map(arg => {
          const floatArg = parseFloat(arg);
          return isNaN(floatArg) ? arg : floatArg;
        });
        return [operationSplit[0], ...args];
      });

      const pipeFn = function (pipe) {
        ops.forEach(([method, ...args]) => {
          pipe = pipe[method](...args);
        });
        return pipe;
      };

      return {
        processor: 'sharp',
        pipe: pipeFn
      };
    })
  });
}

function UrlTransformationInstructions(SuperClass) {
  return class extends SuperClass {
    extractProcess(operation) {
      return operationToProcess(operation);
    }
  };
}

class UrlTransformationInstructionsRoute extends UrlTransformationInstructions(Image) {
  constructor(conf, method = 'GET', path = '/inline/image/{transforms}/{url}', description = 'Route that builds the transform instruction by extracting it from the given url param') {
    super(conf, method, path, description);
  }
}

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig, {CRYPTO: {ENABLED: false}});
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withRoutes([new UrlTransformationInstructionsRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.uri}`) || server);
  });
