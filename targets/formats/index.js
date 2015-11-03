/* eslint no-console: 0 */

var fixtures = require('../../test/fixtures/images/sharp-bench-assets/index'),
  temp = require('temp'),
  nock = require('nock'),
  httpsReader = require('../../src/reader/https'),
  imageProcessor = require('../../src/processor/image'),
  RSVP = require('rsvp'),
  unfoldReaderResult = require('../../src/util/unfold-reader-result'),
  fs = require('fs'),
  path = require('path'),
  SUPPORTED_FORMATS = 'supported-files.md';

temp.track();

var results = {},
  allFixtures = fixtures.all(),
  symbols = {
    ok: '✓',
    err: '✖'
  },
  processors = [{
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
  }],
  queue = RSVP.resolve(),
  endpoint = nock('https://assets.flamingo.tld').persist();

allFixtures.forEach(function (data) {
  endpoint = endpoint.get('/' + data.desc).replyWithFile(200, data.path);
});

processors.forEach(function (processor) {
  results[processor.name] = {};
  var result = results[processor.name];


  allFixtures.forEach(function (data) {
    queue = queue.then(function () {
      return httpsReader({href: 'https://assets.flamingo.tld/' + data.desc}, {HTTPS: {ENABLED: false}}, {
        ALLOW_READ_REDIRECT: false,
        READER: {REQUEST: {TIMEOUT: 3000}}
      }).then(unfoldReaderResult)
        .then(imageProcessor(processor.process, {}))
        .then(function (stream) {
          return new RSVP.Promise(function(resolve) {
            stream.on('error', function(){
              result[data.desc] = false;
              resolve();
            });
            stream.on('finish', function(){
              result[data.desc] = true;
              resolve();
            });
            stream.pipe(temp.createWriteStream());
          });
        });
    });
  });
});

queue.catch(function (e) {
  console.warn('caught', e);
}).finally(function () {
  var out = ['# Supported formats', ''],
    firstRow = ['input'].concat(Object.keys(results));

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
}).catch(function(err){
  console.error(err);
});
