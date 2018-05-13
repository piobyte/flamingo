import fs = require('fs');
import path = require('path');
import assert = require('assert');
import sinon = require('sinon');
import merge = require('lodash/merge');
import got = require('got');

import Route = require('../../../src/model/route');
import ImageStream = require('../../../src/mixins/image-stream');
import Convert = require('../../../src/mixins/convert');
import Server = require('../../../src/model/server');
import Config = require('../../../config');
import NoopAddonLoader = require('../../test-util/NoopAddonLoader');

const HOST = 'localhost';
const PORT = 43723; // some random unused port

async function startServer(localConf, route: Route) {
  let config = await Config.fromEnv();
  config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

  return new Server(config, new NoopAddonLoader()).withRoutes([route]).start();
}

describe('image-stream', function() {
  it('rejects handling for non image streams', async function() {
    const image = fs.createReadStream(path.join(__dirname, 'image-stream.js'));
    const errorSpy = sinon.spy();

    const ImageStreamRoute = class extends ImageStream(Convert(Route)) {
      constructor() {
        super({}, 'GET', '/non-image');
      }

      buildOperation(request, reply) {
        return super.buildOperation(request, reply).then(operation => {
          operation.reader = operation =>
            Promise.resolve({
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
    try {
      server = await startServer({}, new ImageStreamRoute());
      await got(`${HOST}:${PORT}/non-image`).catch(e => e);
      assert.ok(errorSpy.called);
    } finally {
      server.stop();
    }
  });
});
