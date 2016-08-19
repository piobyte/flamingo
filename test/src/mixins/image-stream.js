const ImageStream = require('../../../src/mixins/image-stream');
const Convert = require('../../../src/mixins/convert');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const assert = require('assert');
const sinon = require('sinon');
const Route = require('../../../src/model/route');
const Server = require('../../../src/model/server');
const Config = require('../../../config');
const merge = require('lodash/merge');
const noop = require('lodash/noop');
const got = require('got');

const HOST = 'localhost';
const PORT = 43723; // some random unused port

function startServer(localConf, route) {
  return Config.fromEnv().then(config => {
    config = merge({}, config, {CRYPTO: {ENABLED: false}, PORT: PORT}, localConf);

    return new Server(config, {hook: () => noop})
      .withRoutes([route])
      .start();
  });
}

describe('image-stream', function () {
  it('rejects handling for non image streams', function () {
    const image = fs.createReadStream(path.join(__dirname, 'image-stream.js'));
    const errorSpy = sinon.spy();

    const ImageStreamRoute = class extends ImageStream(Convert(Route)) {
      constructor(conf, method = 'GET', path = '/non-image') {
        super(conf, method, path);
      }

      buildOperation(request, reply) {
        return super.buildOperation(request, reply).then(operation => {
          operation.reader = (operation) => Promise.resolve({
            stream: () => Promise.resolve(image),
            type: 'remote'
          });
          return operation;
        });
      }

      handleError(request, reply, error, operation = {}) {
        errorSpy(...arguments);
        super.handleError(request, reply, error, operation);
      }
    };

    let server;
    return startServer({}, new ImageStreamRoute()).then((startedServer) => {
      server = startedServer;

      return got(`${HOST}:${PORT}/non-image`).catch(e => e);
    }).then(() => {
      assert.ok(errorSpy.called);
    }).finally(() => server.stop());
  });
});
