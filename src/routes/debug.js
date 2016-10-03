'use strict';
/*eslint new-cap: 0*/

const pkg = require('../../package.json');
const Promise = require('bluebird');
const fs = require('fs');
const images = require('../../test/fixtures/images/sharp-bench-assets/index');
const simpleHttpServer = require('../../test/test-util/simple-http-server');
const nodePath = require('path');
const url = require('url');
const Route = require('../model/route');
const {encode} = require('../util/cipher');
const omit = require('lodash/omit');

let IMAGES;


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

    simpleHttpServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      fs.createReadStream(nodePath.join(__dirname, '../../test/fixtures/images/sharp-bench-assets', url.parse(req.url).pathname))
        .pipe(res, {end: true});
    }).then(httpServer => {
      const URL = url.format({protocol: 'http', hostname: httpServer.address().address, port: httpServer.address().port});
      IMAGES = images.all().map(function (image) {
        image.url = `${URL}/${image.filename}`;
        return image;
      });

      return Promise.all(IMAGES.map((image) => encode(image.url, config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV)))
        .then((encodedUrls) => {
          IMAGES = encodedUrls.map((encoded, i) => {
            IMAGES[i].enc = encoded;
            return IMAGES[i];
          });
        });
    });
  }

  handle(operation) {
    const base = '/';
    let profileNames = Object.keys(this.server.profiles);
    let processors = ['vips', 'gm'];

    // only use debug routes
    profileNames = profileNames
      .filter((name) => name.indexOf('debug-') === 0);

    return Promise.resolve(operation.reply({
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
      urls: IMAGES,
      config: omit(operation.config, 'CRYPTO')
    }));
  }
}

module.exports = Debug;
