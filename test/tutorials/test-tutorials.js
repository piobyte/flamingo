const assert = require('assert');
const path = require('path');
const got = require('got');

const expected = [{
  file: 'image-meta.js',
  url: 'http://localhost:3000/image/https%3A%2F%2Fd11xdyzr0div58.cloudfront.net%2Fstatic%2Farchnavbar%2Farchlogo.4fefb38dc270.png',
  ok: (response) => {
    assert.deepEqual(JSON.parse(response.body), {
      width: 190,
      height: 40,
      type: 'png',
      mime: 'image/png',
      wUnits: 'px',
      hUnits: 'px',
      length: 4192
    });
  }
}, {
  file: 'hmac-image-convert.js',
  url: 'http://localhost:3000/image/preview-image/8ed2a7dcd4837ed6da0fc4cb3f3f5c4acfe8465081cbd1580412638bb057ec4b/https%3A%2F%2Fwww.wikipedia.org%2Fportal%2Fwikipedia.org%2Fassets%2Fimg%2FWikipedia-logo-v2.png',
  ok: (response) => {
    assert.deepEqual(response.statusCode, 200);
  }
}, {
  file: 'markdown-to-image.js',
  url: 'http://localhost:3000/md/preview-image/%23%20headline%0A%0Awasd?size=500',
  ok: (response) => {
    assert.deepEqual(response.statusCode, 200);
  }
}];

describe('tutorials work as expected', function () {
  expected.forEach(({file, url, ok}) => {
    it(`${file}`, function () {
      let server;
      return require(path.join('../../tutorials', file))
        .then((createdServer) => {
          server = createdServer;
          return got(url);
        })
        .then((response) => ok(response))
        .finally(() => server.stop());
    });
  });
});

