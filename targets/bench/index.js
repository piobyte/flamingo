/*eslint no-console: 0*/

var temp = require('temp'),
  RSVP = require('rsvp'),
  uuid = require('node-uuid'),
  pkg = require('../../package'),
  fingerprint = require('./fingerprint'),
  debugProfiles = require('../../src/profiles/debug'),
  imageProcessors = require('../../src/processor/image'),
  sharpAssets = require('../../test/fixtures/images/sharp-bench-assets'),
  gzip = require('./gzip-object');

var BENCH_RESULT_TO_S3 = process.env.BENCH_RESULT_TO_S3 === 'true',
  TAGS = process.env.BENCH_TAG ? [process.env.BENCH_TAG] : [],
  id = uuid.v4(),
  BENCH_FILE = 'benchmark-' + id + '.json',
  BENCH_FILE_GZ = BENCH_FILE + '.gz',
  RUN_CONFIG = {'async': true},
  CONVERT_PROFILES = ['debug-preview-image', 'debug-avatar-image'],
  FILES = sharpAssets.all(),
  benchPromise = RSVP.Promise.resolve(),
  suiteObj = {},
  cycleFn = function cycleFn(event) {
    console.log('\t', String(event.target));
  },
  errorFn = function errorFn(err) {
    console.error(err);
  },
  storeResults = function storeResults(suite, suiteName, profileName) {
    var fastest = suite.filter('fastest').pluck('id'),
      slowest = suite.filter('slowest').pluck('id');

    suiteObj[suiteName] = suiteObj[suiteName] ? suiteObj[suiteName] : {name: suiteName, topics: {}};
    suiteObj[suiteName].topics[profileName] = suiteObj[suiteName].topics[profileName] ? suiteObj[suiteName].topics[profileName] : {
      name: profileName,
      inputs: {}
    };
    suiteObj[suiteName].topics[profileName].inputs[suite.name] = suiteObj[suiteName].topics[profileName].inputs[suite.name] ? suiteObj[suiteName].topics[profileName].inputs[suite.name] : {
      name: suite.name,
      variants: []
    };

    suite.forEach(function (benchmark) {
      suiteObj[suiteName].topics[profileName].inputs[suite.name].variants.push({
        count: benchmark.count,
        cycles: benchmark.cycles,
        hz: benchmark.hz,
        name: benchmark.name,
        stats: {
          rme: benchmark.stats.rme,
          mean: benchmark.stats.mean,
          samples: benchmark.stats.sample.length
        },
        times: benchmark.times,
        slowest: slowest.indexOf(benchmark.id) !== -1,
        fastest: fastest.indexOf(benchmark.id) !== -1
      });
    });
  },
  completeFn = function completeFn(suiteName, profileName, resolve) {
    return function () {
      storeResults(this, suiteName, profileName);
      console.log(profileName, this.name, 'Fastest is ' + this.filter('fastest').pluck('name'), '\n');
      resolve();
    };
  },
  suites = {
    'convert-local': require('./suites/convert-local')({
      temp: temp,
      imageProcessors: imageProcessors,
      profiles: debugProfiles,
      cycle: cycleFn,
      error: errorFn,
      complete: completeFn,
      convertProfiles: CONVERT_PROFILES,
      runConfig: RUN_CONFIG
    }),
    'convert-remote': require('./suites/convert-remote')({
      temp: temp,
      cycle: cycleFn,
      error: errorFn,
      complete: completeFn,
      runConfig: RUN_CONFIG,
      profiles: debugProfiles,
      convertProfiles: CONVERT_PROFILES,
      imageProcessors: imageProcessors
    })
  };

temp.track();

function runSuite(promise, description, filePath) {
  Object.keys(suites).forEach(function (suiteName) {
    promise = promise.then(suites[suiteName].bind(null, suiteName, description, filePath));
  });
  return promise;
}

FILES.forEach(function (file) {
  benchPromise = runSuite(benchPromise, file.desc, file.path);
});
benchPromise.then(function () {
  var benchmarkResult = {
    benchmark: {
      id: id,
      v: pkg.version,
      t: new Date().toISOString(),
      deps: pkg.dependencies,
      fp: fingerprint(),
      tags: TAGS,
      suites: Object.keys(suiteObj).map(function (suiteName) {
        suiteObj[suiteName].topics = Object.keys(suiteObj[suiteName].topics).map(function (topicName) {
          suiteObj[suiteName].topics[topicName].inputs = Object.keys(suiteObj[suiteName].topics[topicName].inputs).map(function (inputName) {
            return suiteObj[suiteName].topics[topicName].inputs[inputName];
          });
          return suiteObj[suiteName].topics[topicName];
        });
        return suiteObj[suiteName];
      })
    }
  };

  return BENCH_RESULT_TO_S3 ?
    gzip(benchmarkResult).then(function (gzipped) {
      require('./upload-s3')(BENCH_FILE_GZ, gzipped);
    }) :
    console.log('result:\n', BENCH_FILE, '\n', JSON.stringify(benchmarkResult));
}).finally(function () {
  /*eslint no-sync: 0 */
  temp.cleanupSync();
}).catch(function (err) {
  console.error(err);
});
