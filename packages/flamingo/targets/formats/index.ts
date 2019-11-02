/* eslint no-console: 0 */

import temp = require('temp');
import nock = require('nock');
import fs = require('fs');
import path = require('path');
import fixtures = require('../../test/fixtures/images/sharp-bench-assets/index');
import httpsReader = require('../../src/reader/https');
import imageProcessor = require('../../src/processor/image');
import unfoldReaderResult = require('../../src/util/unfold-reader-result');
import FlamingoOperation = require('../../src/model/flamingo-operation');
import Promise = require('bluebird');
import sharp = require('sharp');

const SUPPORTED_FORMATS = 'tutorials/supported-files.md';

temp.track();

const results = {};
const allFixtures = fixtures.all();
const symbols = {
  ok: '✓',
  err: '✖'
};
const processors = [{
  name: 'sharp',
  process: [{
    processor: 'sharp',
    pipe: function (sharp: sharp.Sharp) {
      return sharp
        .rotate().resize(200, 200, { fit: 'outside'}).toFormat('png');
    }
  }]
}, {
  name: 'gm (graphicsmagick)',
  process: [{
    processor: 'gm',
    pipe: function (gm) {
      return gm
        .autoOrient().resize('200', '200^').setFormat('png');
    }
  }]
}, {
  name: 'gm (imagemagick)',
  process: [{
    processor: 'gm',
    pipe: function (gm) {
      return gm
        .autoOrient().options({imageMagick: true}).resize('200', '200^').setFormat('png');
    }
  }]
}];

let promise: Promise<any> = Promise.resolve();
let endpoint = nock('https://assets.flamingo.tld').persist();

allFixtures.forEach(function (data) {
  endpoint = endpoint.get('/' + data.desc).replyWithFile(200, data.path);
});

processors.forEach(function (processor) {
  results[processor.name] = {};
  const result = results[processor.name];

  allFixtures.forEach(function (data) {
    promise = promise.then(function () {
      const op = new FlamingoOperation();
      op.config = {
        ACCESS: {HTTPS: {ENABLED: false}},
        ALLOW_READ_REDIRECT: false,
        READER: {REQUEST: {TIMEOUT: 3000}}
      };
      op.process = processor.process;
      op.input = {href: 'https://assets.flamingo.tld/' + data.desc};

      return httpsReader(op).then(unfoldReaderResult)
        .then(imageProcessor(op))
        .then(function (stream) {
          return new Promise(function (resolve) {
            stream.on('error', function () {
              result[data.desc] = false;
              resolve();
            });
            stream.on('finish', function () {
              result[data.desc] = true;
              resolve();
            });
            stream.pipe(temp.createWriteStream());
          });
        });
    });
  });
});

// TODO: promise.finally
promise.catch(function (e) {
  console.warn('caught', e);
}).finally(function () {
  const out = ['# Supported formats', ''];
  const firstRow = ['input'].concat(Object.keys(results));

  out.push(firstRow.join('|'));
  out.push(firstRow.reduce(function (all: string[], title, i) {
    let line = title.replace(/./g, '-');
    if (i > 0) {
      line = ':' + line + ':';
    }
    return all.concat(line);
  }, []).join('|'));

  Object.keys(results[processors[0].name]).forEach(function (inputName) {
    const data = [inputName];
    Object.keys(results).forEach(function (resultName) {
      data.push(results[resultName][inputName] ? symbols.ok : symbols.err);
    });

    out.push(data.join('|'));
  });

  console.log(out.join('\n'));
  fs.writeFileSync(path.join(__dirname, '../../' + SUPPORTED_FORMATS), out.join('\n'), {
    encoding: 'utf8'
  });

  temp.cleanupSync();
}).catch(function (err) {
  console.error(err);
});
