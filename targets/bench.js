var Benchmark = require('benchmark'),
    url = require('url'),
    fs = require('fs'),
    temp = require('temp'),
    path = require('path'),
    RSVP = require('rsvp'),
    http = require('http'),
    httpReader = require('../src/reader/https'),
    debugProfiles = require('../src/profiles/debug'),
    imageProcessors = require('../src/processor/image');

temp.track();

var Promise = RSVP.Promise,
    CONVERT_PROFILES = ['debug-rotate', 'debug-preview-image', 'debug-avatar-image'],
    IMAGE_HOST = '127.0.0.1',
    IMAGE_HOST_PORT = 43722, // some random unused port
    HOST = 'http://' + IMAGE_HOST + ':' + IMAGE_HOST_PORT + '/Saturn_from_Cassini_Orbiter_(2004-10-06).jpg';

var FILES = [{
    desc: 'SMALL-IMAGE (jpg): saturn-640x316px',
    path: path.join(__dirname, '../test/fixtures/images/640px-Saturneclipse.jpg')
},{
    desc: 'LARGE-IMAGE (jpg): saturn-8888x4544px',
    path: path.join(__dirname, '../test/fixtures/images/Saturn_from_Cassini_Orbiter_(2004-10-06).jpg')
}];

var suites = {
    'convert-local': function (description, filePath) {
        var prom = Promise.resolve(),
            streamFunction = function (deferred) {
                return function (data) {
                    var wstream = temp.createWriteStream(),
                        rstream = fs.createReadStream(filePath);

                    wstream.on('finish', function () {
                        deferred.resolve();
                    });
                    imageProcessors(data.process)(rstream).pipe(wstream);
                };
            },
            convertLocal = function (profileName) {
                return new Promise(function (resolve) {
                    console.log('suite convert-local');

                    var suite = new Benchmark.Suite(),
                        gmOptions = {SUPPORTED: {GM: {WEBP: true}}, DEFAULT_MIME: 'image/png'},
                        gmRequest = {headers: {}, query: {processor: 'gm'}},
                        vipsOptions = {DEFAULT_MIME: 'image/png'},
                        vipsRequest = {headers: {}, query: {}};

                    // start benchmarking
                    suite
                        .add(description + '-' + profileName + '#gm', {
                            defer: true, fn: function (deferred) {
                                debugProfiles[profileName](gmRequest, gmOptions).then(streamFunction(deferred));
                            }
                        })
                        .add(description + '-' + profileName + '#vips', {
                            defer: true, fn: function (deferred) {
                                debugProfiles[profileName](vipsRequest, vipsOptions).then(streamFunction(deferred));
                            }
                        })
                        .on('cycle', function (event) {
                            console.log(String(event.target));
                        })
                        .on('complete', function () {
                            console.log('Fastest is ' + this.filter('fastest').pluck('name'));
                            resolve();
                        })
                        .run({'async': true});
                });
            };

        CONVERT_PROFILES.forEach(function (name) {
            prom = prom.then(function () {
                return convertLocal(name);
            });
        });

        return prom;
    },
    'convert-remote': function (description, filePath) {
        var prom = Promise.resolve(),
            server = startImageServer();

        function startImageServer() {
            // TODO: maybe launch in another process
            var server = http.createServer(function (req, res) {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                fs.createReadStream(filePath).pipe(res, {end: true});
            });
            server.timeout = 4 * 1000; // 4 sec
            server.listen(IMAGE_HOST_PORT, IMAGE_HOST);
            return server;
        }

        var convertRemote = function (profileName) {
            return new Promise(function (resolve) {
                console.log('suite convert-remote');
                var suite = new Benchmark.Suite();

                suite
                    .add(description + '-' + profileName + '#gm', {
                        defer: true,
                        fn: function (deferred) {
                            httpReader(url.parse(HOST), {HTTPS: {ENABLED: false}}).then(function (data) {
                                data.stream().then(function (rstream) {
                                    debugProfiles[profileName]({
                                        headers: {},
                                        query: {processor: 'gm'}
                                    }, {
                                        SUPPORTED: {GM: {WEBP: true}},
                                        DEFAULT_MIME: 'image/png'
                                    }).then(function (profileData) {
                                        var wstream = temp.createWriteStream();
                                        wstream.on('finish', function () {
                                            deferred.resolve();
                                        });
                                        imageProcessors(profileData.process)(rstream)
                                            .pipe(wstream);
                                    });
                                });
                            });
                        }
                    })
                    .add(description + '-' + profileName + '#vips', {
                        defer: true,
                        fn: function (deferred) {
                            httpReader(url.parse(HOST), {HTTPS: {ENABLED: false}}).then(function (data) {
                                data.stream().then(function (rstream) {
                                    debugProfiles[profileName]({
                                        headers: {}, query: {}
                                    }, {
                                        DEFAULT_MIME: 'image/png'
                                    }).then(function (profileData) {
                                        var wstream = temp.createWriteStream();

                                        wstream.on('finish', function () {
                                            deferred.resolve();
                                        });
                                        imageProcessors(profileData.process)(rstream).pipe(wstream);
                                    });
                                });
                            });
                        }
                    })
                    .on('cycle', function (event) {
                        console.log(String(event.target));
                    })
                    .on('error', function (err) {
                        console.log(err);
                    })
                    .on('complete', function () {
                        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
                        resolve();
                    })
                    .run({'async': true});
            });
        };

        CONVERT_PROFILES.forEach(function (name) {
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
    }
};

function runSuite(promise, description, filePath) {
    Object.keys(suites).forEach(function (suiteName) {
        promise = promise.then(suites[suiteName].bind(null, description, filePath));
    });
    return promise;
}

var prom = Promise.resolve();

FILES.forEach(function (file) {
    prom = runSuite(prom, file.desc, file.path);
});

prom.finally(function () {
    temp.cleanupSync();
});
