var url = require('url'),
    Benchmark = require('benchmark'),
    RSVP = require('rsvp'),
    httpReader = require('../../../src/reader/https'),
    startImageServer = require('../start-image-server');

var IMAGE_HOST = '127.0.0.1',
    IMAGE_HOST_PORT = 43722, // some random unused port
    HOST = 'http://' + IMAGE_HOST + ':' + IMAGE_HOST_PORT + '/Saturn_from_Cassini_Orbiter_(2004-10-06).jpg';

module.exports = function (suiteConfig) {
    return function (suiteName, description, filePath) {
        var prom = RSVP.Promise.resolve(),
            server = startImageServer(IMAGE_HOST, IMAGE_HOST_PORT, filePath);

        var convertRemote = function (profileName) {
            return new RSVP.Promise(function (resolve) {
                new Benchmark.Suite(description).add('GM', {
                    defer: true,
                    fn: function (deferred) {
                        httpReader(url.parse(HOST), {HTTPS: {ENABLED: false}}).then(function (data) {
                            data.stream().then(function (rstream) {
                                suiteConfig.profiles[profileName]({
                                    headers: {},
                                    query: {processor: 'gm'}
                                }, {
                                    SUPPORTED: {GM: {WEBP: true}},
                                    DEFAULT_MIME: 'image/png'
                                }).then(function (profileData) {
                                    var wstream = suiteConfig.temp.createWriteStream();
                                    wstream.on('finish', function () {
                                        deferred.resolve();
                                    });
                                    suiteConfig.imageProcessors(profileData.process)(rstream)
                                        .pipe(wstream);
                                });
                            });
                        });
                    }
                })
                    .add('VIPS', {
                        defer: true,
                        fn: function (deferred) {
                            httpReader(url.parse(HOST), {HTTPS: {ENABLED: false}}).then(function (data) {
                                data.stream().then(function (rstream) {
                                    suiteConfig.profiles[profileName]({
                                        headers: {}, query: {}
                                    }, {
                                        DEFAULT_MIME: 'image/png'
                                    }).then(function (profileData) {
                                        var wstream = suiteConfig.temp.createWriteStream();

                                        wstream.on('finish', function () {
                                            deferred.resolve();
                                        });
                                        suiteConfig.imageProcessors(profileData.process)(rstream).pipe(wstream);
                                    });
                                });
                            });
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
        prom.then(function () {
            return new RSVP.Promise(function (resolve) {
                server.close(function () {
                    resolve();
                });
            });
        });
        return prom;
    };
};
