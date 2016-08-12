'use strict';

const pkg = require('../../package');
const Promise = require('bluebird');
const fs = require('fs');
const images = require('../../test/fixtures/images/sharp-bench-assets/index');
const simpleHttpServer = require('../../test/test-util/simple-http-server');
const path = require('path');
const url = require('url');
const Route = require('../model/route');
const {encode} = require('../util/cipher');

const DEBUG_PORT = 43723;
const DEBUG_HOST = 'localhost';

simpleHttpServer(DEBUG_HOST, DEBUG_PORT, function (req, res) {
  res.writeHead(200, {'Content-Type': 'image/jpeg'});
  fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/sharp-bench-assets', url.parse(req.url).pathname))
    .pipe(res, {end: true});
});

/*eslint no-sync:0 */
const HOST = 'http://' + DEBUG_HOST + ':' + DEBUG_PORT + '/';

let IMAGES = images.all().map(function (image) {
  image.url = `${HOST}${image.filename}`;
  return image;
});

/*eslint new-cap: 0*/

/**
 * Debug route that exposes many internal values, should not be used in production
 * @class
 * @extends Route
 */
class Debug extends Route {
  /**
   *
   * @param {Config} config
   * @param {string} [method='GET']
   * @param {string} [path='/_debug']
   * @param {string} [description='Debug']
     */
  constructor(config = {}, method = 'GET', path = '/_debug', description = 'Debug') {
    super(config, method, path, description);

    Promise.all(IMAGES.map((image) => encode(image.url, config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV)))
      .then((encodedUrls) => {
        IMAGES = encodedUrls.map((encoded, i) => {
          IMAGES[i].enc = encoded;
          return IMAGES[i];
        });
      });
  }

  handle(operation) {
    const base = '/';
    let profileNames = Object.keys(operation.profiles);
    let processors = ['vips', 'gm'];

    // only use debug routes
    profileNames = profileNames
      .filter((name) => name.indexOf('debug-') === 0);

    if (operation.request.query.profiles) {
      profileNames = operation.request.query.profiles.split(',');
    }
    if (operation.request.query.processors) {
      processors = operation.request.query.processors.split(',');
    }

    return operation.reply({
      routes: this.server.hapi.connections[0].table().map(t => ({
        method: t.method,
        path: t.path,
        description: t.settings.description
      })),
      addons: this.server.addonsLoader.addons,
      processors: processors,
      base,
      pkg: pkg,
      profiles: profileNames,
      urls: IMAGES
    });
  }
}

module.exports = Debug;
