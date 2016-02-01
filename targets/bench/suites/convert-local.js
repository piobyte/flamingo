const fs = require('fs');
const Benchmark = require('benchmark');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const RSVP = require('rsvp');

module.exports = function (suiteConfig) {
  return function (suiteName, description, filePath) {
    let prom = RSVP.Promise.resolve();

    function streamFunction(deferred) {
      return function (data) {
        const wstream = suiteConfig.temp.createWriteStream();
        const rstream = fs.createReadStream(filePath);
        const op = new FlamingoOperation();
        let error;

        op.profile = {
          process: data.process
        };

        wstream.on('finish', function () {
          if (error) {
            deferred.benchmark.abort();
          }
          deferred.resolve();
        });
        suiteConfig.imageProcessors(op)(rstream)
          .on('error', function (err) {
            error = err;
            wstream.end();
            this.end();
          })
          .pipe(wstream);
      };
    }

    function convertLocal(profileName) {
      return new RSVP.Promise(function (resolve) {
        const gmOptions = {SUPPORTED: {GM: {WEBP: true}}, DEFAULT_MIME: 'image/png'};
        const gmRequest = {headers: {}, query: {processor: 'gm'}};
        const vipsOptions = {DEFAULT_MIME: 'image/png'};
        const vipsRequest = {headers: {}, query: {}};

        // start benchmarking
        new Benchmark.Suite(description).add('GM', {
          defer: true, fn: function (deferred) {
            suiteConfig.profiles[profileName](gmRequest, gmOptions).then(streamFunction(deferred));
          }
        })
          .add('VIPS', {
            defer: true, fn: function (deferred) {
              suiteConfig.profiles[profileName](vipsRequest, vipsOptions).then(streamFunction(deferred));
            }
          })
          .on('cycle', suiteConfig.cycle)
          .on('error', suiteConfig.error)
          .on('complete', suiteConfig.complete(suiteName, profileName, resolve))
          .run(suiteConfig.runConfig);
      });
    }

    suiteConfig.convertProfiles.forEach(function (name) {
      prom = prom.then(function () {
        return convertLocal(name);
      });
    });

    return prom;
  };
};
