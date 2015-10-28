var fs = require('fs'),
  Benchmark = require('benchmark'),
  RSVP = require('rsvp');

module.exports = function (suiteConfig) {
  return function (suiteName, description, filePath) {
    var prom = RSVP.Promise.resolve(),
      streamFunction = function (deferred) {
        return function (data) {
          var wstream = suiteConfig.temp.createWriteStream(),
            rstream = fs.createReadStream(filePath);

          wstream.on('finish', function () {
            deferred.resolve();
          });
          suiteConfig.imageProcessors(data.process, {})(rstream).pipe(wstream);
        };
      },
      convertLocal = function (profileName) {
        return new RSVP.Promise(function (resolve) {
          var gmOptions = {SUPPORTED: {GM: {WEBP: true}}, DEFAULT_MIME: 'image/png'},
            gmRequest = {headers: {}, query: {processor: 'gm'}},
            vipsOptions = {DEFAULT_MIME: 'image/png'},
            vipsRequest = {headers: {}, query: {}};

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
      };

    suiteConfig.convertProfiles.forEach(function (name) {
      prom = prom.then(function () {
        return convertLocal(name);
      });
    });

    return prom;
  };
};
