const url = require('url');
const Benchmark = require('benchmark');
const RSVP = require('rsvp');
const httpReader = require('../../../src/reader/https');
const fs = require('fs');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const simpleServer = require('../../../test/test-util/simple-http-server');

const IMAGE_HOST = '127.0.0.1';
const IMAGE_HOST_PORT = 43722; // some random unused port
const HOST = `http://${IMAGE_HOST}:${IMAGE_HOST_PORT}/Saturn_from_Cassini_Orbiter_(2004-10-06).jpg`;

function error(err) {
  /* eslint no-console: 0 */
  console.error(err);
}

module.exports = function (suiteConfig) {
  return function (suiteName, description, filePath) {
    let prom = RSVP.Promise.resolve();
    const server = simpleServer(IMAGE_HOST, IMAGE_HOST_PORT, function (req, res) {
      res.writeHead(200, {'Content-Type': 'image/jpeg'});
      fs.createReadStream(filePath).pipe(res, {end: true});
    });

    var convertRemote = function (profileName) {
      return new RSVP.Promise(function (resolve) {
        new Benchmark.Suite(description).add('GM', {
          defer: true,
          fn: function (deferred) {
            var op = new FlamingoOperation();
            op.targetUrl = url.parse(HOST);
            op.config = {
              ACCESS: {HTTPS: {ENABLED: false}},
              ALLOW_READ_REDIRECT: 0,
              READER: {REQUEST: {TIMEOUT: 2000}}
            };
            httpReader(op).then(function (data) {
              return data.stream().then(function (rstream) {
                return suiteConfig.profiles[profileName]({
                  headers: {},
                  query: {processor: 'gm'}
                }, {
                  SUPPORTED: {GM: {WEBP: true}},
                  DEFAULT_MIME: 'image/png'
                }).then(function (profileData) {
                  const wstream = suiteConfig.temp.createWriteStream();
                  const op = new FlamingoOperation();
                  let error;

                  op.profile = {
                    process: profileData.process
                  };

                  wstream.on('finish', function () {
                    if (error) {
                      deferred.benchmark.abort();
                    }
                    deferred.resolve();
                  });
                  wstream.on('error', function (err) {
                    error = err;
                    wstream.end();
                  });
                  var processorStream = suiteConfig.imageProcessors(op)(rstream);
                  processorStream.on('error', function (err) {
                    error = err;
                    wstream.end();
                    processorStream.end();
                  });
                  processorStream.pipe(wstream);
                });
              });
            }).catch(error);
          }
        }).add('VIPS', {
          defer: true,
          fn: function (deferred) {
            var op = new FlamingoOperation();
            op.targetUrl = url.parse(HOST);
            op.config = {
              ACCESS: {HTTPS: {ENABLED: false}},
              ALLOW_READ_REDIRECT: 0,
              READER: {REQUEST: {TIMEOUT: 2000}}
            };
            httpReader(op).then(function (data) {
              return data.stream().then(function (rstream) {
                return suiteConfig.profiles[profileName]({
                  headers: {}, query: {}
                }, {
                  DEFAULT_MIME: 'image/png'
                }).then(function (profileData) {
                  const wstream = suiteConfig.temp.createWriteStream();
                  const op = new FlamingoOperation();
                  let error;

                  op.profile = {
                    process: profileData.process
                  };

                  wstream.on('finish', function () {
                    if (error) {
                      deferred.benchmark.abort();
                    }
                    deferred.resolve();
                  });
                  wstream.on('error', function (err) {
                    error = err;
                    wstream.end();
                  });
                  var processorStream = suiteConfig.imageProcessors(op)(rstream);
                  processorStream.on('error', function (err) {
                    error = err;
                    wstream.end();
                    processorStream.end();
                  });
                  processorStream.pipe(wstream);
                });
              });
            }).catch(error);
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
        return convertRemote(name);
      });
    });
    prom.then(() => server.stop());
    return prom;
  };
};
