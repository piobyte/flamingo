/*eslint no-console: 0*/

import temp = require('temp');
import uuidV4 = require('uuid/v4');
import fingerprint = require('./fingerprint');
import debugProfiles = require('../../src/profiles/debug');
import imageProcessors = require('../../src/processor/image');
import sharpAssets = require('../../test/fixtures/images/sharp-bench-assets');
const pkg = require('../../package.json');

let benchPromise = Promise.resolve();

const TAGS = process.env.BENCH_TAG ? [process.env.BENCH_TAG] : [];
const id = uuidV4();
const BENCH_FILE = `benchmark-${id}.json`;
const RUN_CONFIG = {'async': true};
const CONVERT_PROFILES = ['debug-preview-image', 'debug-avatar-image'];
const FILES = sharpAssets.all();
const suiteObj = {};
function cycleFn (event) {
  console.log('\t', String(event.target));
}
function errorFn (err) {
  console.error(err);
}
function storeResults (suite, suiteName, profileName) {
  const fastest = suite.filter('fastest').map('id');
  const slowest = suite.filter('slowest').map('id');

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
}
function completeFn (suiteName, profileName, resolve) {
  return function () {
    storeResults(this, suiteName, profileName);
    console.log(profileName, this.name, 'Fastest is ' + this.filter('fastest').map('name'), '\n');
    resolve();
  };
}
const suites = {
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

function runSuite (promise, description, filePath) {
  Object.keys(suites).forEach(function (suiteName) {
    promise = promise.then(suites[suiteName].bind(null, suiteName, description, filePath));
  });
  return promise;
}

FILES.forEach(function (file) {
  benchPromise = runSuite(benchPromise, file.desc, file.path);
});
benchPromise.then(function () {
  const benchmarkResult = {
    benchmark: {
      id,
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

  console.log('result:\n', BENCH_FILE, '\n', JSON.stringify(benchmarkResult));
  // TODO: promise.finally
}).finally(function () {
  /*eslint no-sync: 0 */
  temp.cleanupSync();
}).catch(function (err) {
  console.error(err);
});
