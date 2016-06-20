/* eslint no-console: 0 */

const fixtures = require('../../test/fixtures/images/sharp-bench-assets/index');
const temp = require('temp');
const nock = require('nock');
const httpsReader = require('../../src/reader/https');
const imageProcessor = require('../../src/processor/image');
const Promise = require('bluebird');
const unfoldReaderResult = require('../../src/util/unfold-reader-result');
const FlamingoOperation = require('../../src/model/flamingo-operation');
const fs = require('fs');
const path = require('path');
const SUPPORTED_FORMATS = 'supported-files.md';

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
    pipe: function (sharp) {
      return sharp
        .rotate().resize(200, 200).min().toFormat('png');
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

let promise = Promise.resolve();
let endpoint = nock('https://assets.flamingo.tld').persist();

allFixtures.forEach(function (data) {
  endpoint = endpoint.get('/' + data.desc).replyWithFile(200, data.path);
});

processors.forEach(function (processor) {
  results[processor.name] = {};
  var result = results[processor.name];

  allFixtures.forEach(function (data) {
    promise = promise.then(function () {
      var op = new FlamingoOperation();
      op.config = {
        ACCESS: {HTTPS: {ENABLED: false}},
        ALLOW_READ_REDIRECT: false,
        READER: {REQUEST: {TIMEOUT: 3000}}
      };
      op.profile = {
        process: processor.process
      };
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

promise.catch(function (e) {
  console.warn('caught', e);
}).finally(function () {
  const out = ['# Supported formats', ''];
  const firstRow = ['input'].concat(Object.keys(results));

  out.push(firstRow.join('|'));
  out.push(firstRow.reduce(function (all, title, i) {
    var line = title.replace(/./g, '-');
    if (i > 0) {
      line = ':' + line + ':';
    }
    return all.concat(line);
  }, []).join('|'));

  Object.keys(results[processors[0].name]).forEach(function (inputName) {
    var data = [inputName];
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
