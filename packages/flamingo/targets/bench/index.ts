/*eslint no-console: 0*/

// @ts-ignore
import temp = require("temp");
import uuid = require("uuid");
import fingerprint = require("./fingerprint");
import debugProfiles = require("../../src/profiles/debug");
import imageProcessors = require("../../src/processor/image");
import sharpAssets = require("../../test/fixtures/images/sharp-bench-assets");
import { Suite } from "benchmark";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../../package.json");

let benchPromise = Promise.resolve();

const TAGS = process.env.BENCH_TAG ? [process.env.BENCH_TAG] : [];
const id = uuid.v4();
const BENCH_FILE = `benchmark-${id}.json`;
const RUN_CONFIG = { async: true };
const CONVERT_PROFILES = ["debug-preview-image", "debug-avatar-image"];
const FILES = sharpAssets.all();
const suiteObj: Record<
  string,
  { name: string; topics: Record<string, any> }
> = {};
function cycleFn(event: { target: any }) {
  console.log("\t", String(event.target));
}
function errorFn(err: Error) {
  console.error(err);
}
function storeResults(
  suite: Suite & { name: string },
  suiteName: string,
  profileName: string
) {
  const fastest = suite
    .filter("fastest")
    // @ts-ignore
    .map("id");
  const slowest = suite
    .filter("slowest")
    // @ts-ignore
    .map("id");

  suiteObj[suiteName] = suiteObj[suiteName]
    ? suiteObj[suiteName]
    : { name: suiteName, topics: {} };
  suiteObj[suiteName].topics[profileName] = suiteObj[suiteName].topics[
    profileName
  ]
    ? suiteObj[suiteName].topics[profileName]
    : {
        name: profileName,
        inputs: {},
      };
  suiteObj[suiteName].topics[profileName].inputs[suite.name] = suiteObj[
    suiteName
  ].topics[profileName].inputs[suite.name]
    ? suiteObj[suiteName].topics[profileName].inputs[suite.name]
    : {
        name: suite.name,
        variants: [],
      };

  suite.forEach(function (benchmark: any) {
    suiteObj[suiteName].topics[profileName].inputs[suite.name].variants.push({
      count: benchmark.count,
      cycles: benchmark.cycles,
      hz: benchmark.hz,
      name: benchmark.name,
      stats: {
        rme: benchmark.stats.rme,
        mean: benchmark.stats.mean,
        samples: benchmark.stats.sample.length,
      },
      times: benchmark.times,
      slowest: slowest.indexOf(benchmark.id) !== -1,
      fastest: fastest.indexOf(benchmark.id) !== -1,
    });
  });
}
function completeFn(
  suiteName: string,
  profileName: string,
  resolve: () => unknown
) {
  return function (this: Suite & { name: string }) {
    storeResults(this, suiteName, profileName);
    console.log(
      profileName,
      this.name,
      "Fastest is " +
        this.filter("fastest")
          // @ts-ignore
          .map("name"),
      "\n"
    );
    resolve();
  };
}
const suites = {
  "convert-local":
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("./suites/convert-local")({
      temp: temp,
      imageProcessors: imageProcessors,
      profiles: debugProfiles,
      cycle: cycleFn,
      error: errorFn,
      complete: completeFn,
      convertProfiles: CONVERT_PROFILES,
      runConfig: RUN_CONFIG,
    }),
  "convert-remote":
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("./suites/convert-remote")({
      temp: temp,
      cycle: cycleFn,
      error: errorFn,
      complete: completeFn,
      runConfig: RUN_CONFIG,
      profiles: debugProfiles,
      convertProfiles: CONVERT_PROFILES,
      imageProcessors: imageProcessors,
    }),
};

temp.track();

function runSuite(
  promise: Promise<any>,
  description: string,
  filePath: string
) {
  Object.keys(suites).forEach(function (suiteName) {
    promise = promise.then(
      // @ts-ignore
      suites[suiteName].bind(null, suiteName, description, filePath)
    );
  });
  return promise;
}

FILES.forEach(function (file) {
  benchPromise = runSuite(benchPromise, file.desc, file.path);
});
benchPromise
  .then(function () {
    const benchmarkResult = {
      benchmark: {
        id,
        v: pkg.version,
        t: new Date().toISOString(),
        deps: pkg.dependencies,
        fp: fingerprint(),
        tags: TAGS,
        suites: Object.keys(suiteObj).map(function (suiteName) {
          suiteObj[suiteName].topics = Object.keys(
            suiteObj[suiteName].topics
          ).map(function (topicName) {
            suiteObj[suiteName].topics[topicName].inputs = Object.keys(
              suiteObj[suiteName].topics[topicName].inputs
            ).map(function (inputName) {
              return suiteObj[suiteName].topics[topicName].inputs[inputName];
            });
            return suiteObj[suiteName].topics[topicName];
          });
          return suiteObj[suiteName];
        }),
      },
    };

    console.log("result:\n", BENCH_FILE, "\n", JSON.stringify(benchmarkResult));
    // TODO: promise.finally
  })
  .finally(function () {
    /*eslint no-sync: 0 */
    temp.cleanupSync();
  })
  .catch(function (err) {
    console.error(err);
  });
