import fs = require("fs");
import Benchmark = require("benchmark");
import FlamingoOperation = require("../../../src/model/flamingo-operation");
import { Deferred } from "benchmark";

module.exports = function (suiteConfig: any) {
  return function (suiteName: string, description: string, filePath: string) {
    let prom: Promise<any> = Promise.resolve();

    function streamFunction(deferred: Deferred) {
      return function (data: any) {
        const wstream = suiteConfig.temp.createWriteStream();
        const rstream = fs.createReadStream(filePath);
        const op = new FlamingoOperation();
        let error: Error;

        op.process = data.process;
        op.config = {};

        wstream.on("finish", function () {
          if (error) {
            deferred.benchmark.abort();
          }
          // @ts-ignore
          deferred.resolve();
        });
        suiteConfig
          .imageProcessors(op)(rstream)
          .on("error", function (err: Error) {
            error = err;
            wstream.end();
            // @ts-ignore
            this.end();
          })
          .pipe(wstream);
      };
    }

    function convertLocal(profileName: string) {
      return new Promise(function (resolve) {
        const gmOptions = { DEFAULT_MIME: "image/png" };
        const gmRequest = { headers: {}, query: { processor: "gm" } };
        const vipsOptions = { DEFAULT_MIME: "image/png" };
        const vipsRequest = { headers: {}, query: {} };

        // start benchmarking
        new Benchmark.Suite(description)
          .add("GM", {
            defer: true,
            fn: function (deferred: Deferred) {
              suiteConfig.profiles[profileName](gmRequest, gmOptions).then(
                streamFunction(deferred)
              );
            },
          })
          .add("VIPS", {
            defer: true,
            fn: function (deferred: Deferred) {
              suiteConfig.profiles[profileName](vipsRequest, vipsOptions).then(
                streamFunction(deferred)
              );
            },
          })
          .on("cycle", suiteConfig.cycle)
          .on("error", suiteConfig.error)
          .on("complete", suiteConfig.complete(suiteName, profileName, resolve))
          .run(suiteConfig.runConfig);
      });
    }

    suiteConfig.convertProfiles.forEach(function (name: string) {
      prom = prom.then(function () {
        return convertLocal(name);
      });
    });

    return prom;
  };
};
