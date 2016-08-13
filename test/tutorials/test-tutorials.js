const assert = require('assert');
const path = require('path');
const got = require('got');
const fs = require('fs');
const url = require('url');
const simpleHttpServer = require('../test-util/simple-http-server');


function startAssetsServer(host, port) {
  return simpleHttpServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/sharp-bench-assets', url.parse(req.url).pathname))
      .pipe(res, {end: true});
  }, port, host);
}

const ASSETS_PORT = 9999;
const ASSETS_HOST = 'localhost';
const assetsServer = startAssetsServer(ASSETS_HOST, ASSETS_PORT);
const FLAMINGO_PORT = 3000;
const HOST = ASSETS_HOST;
const IMAGE_URL = encodeURIComponent(url.format({protocol: 'http', hostname: ASSETS_HOST, port: ASSETS_PORT, pathname: '/Landscape_5.jpg'}));

const expected = [{
  file: 'image-meta.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/image/${IMAGE_URL}`}),
  ok(response) {
    assert.deepEqual(JSON.parse(response.body), {
      width: 450,
      height: 600,
      type: 'jpg',
      mime: 'image/jpeg',
      wUnits: 'px',
      hUnits: 'px'
    });
  }
}, {
  // TODO: constant hash
  file: 'hmac-image-convert.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/image/preview-image/a3fb18e9c39d61a654d85ed0f2a9954e1f2f4b42cbc4d04a0e3a6c58a2e46c39/${IMAGE_URL}`}),
  ok(response) {
    assert.deepEqual(response.statusCode, 200);
  }
}, {
  file: 'hmac-image-convert.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/image/preview-image/eeeb18e9c39d61a654d85ed0f2a9954e1f2f4b42cbc4d04a0e3a6c58a2e46c39/${IMAGE_URL}`}),
  error(response) {
    assert.equal(response.statusCode, 400);
  }
}, {
  file: 'markdown-to-image.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: '/md/preview-image/%23%20headline%0A%0Awasd?size=500'}),
  ok(response) {
    assert.deepEqual(response.statusCode, 200);
  }
}, {
  file: 'custom-urls.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/convert/image/preview-image/${IMAGE_URL}`}),
  ok(response) {
    assert.deepEqual(response.statusCode, 200);
  }
}, {
  file: 'url-transformation-instructions.js',
  url: url.format({protocol: 'http', hostname: HOST, port: FLAMINGO_PORT, pathname: `/inline/image/resize=300:100,toFormat=webp,rotate=90,min/${IMAGE_URL}`}),
  ok(response) {
    assert.deepEqual(response.statusCode, 200);
  }
}];

describe('tutorials work as expected', function () {
  after(function () {
    return assetsServer.stop();
  });

  expected.forEach(({file, url, ok, error}) => {
    it(`${file}`, function () {
      let server;
      return require(path.join('../../tutorials', file))({HOST, PORT: FLAMINGO_PORT})
        .then((createdServer) => {
          server = createdServer;
          const request = got(url);
          return error ? request.catch(error) : request.then(ok);
        })
        .finally(() => server.stop());
    });
  });
});

