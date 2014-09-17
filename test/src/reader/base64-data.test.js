/* global describe, it */

var fixture = require('../../test-util/fixture'),
    gm = require('gm'),
    temp = require('temp'),
    url = require('url'),
    fs = require('fs'),
    RSVP = require('rsvp'),
    dataReader = require('../../../src/reader/data'),
    assert = require('assert');

var compareDataFixtures = function (base64Prefix, fixtureBase64Path, fixturePath) {
    return new RSVP.Promise(function (resolve, reject) {
        fixture.loadFixture(fixtureBase64Path).then(function (fixtureData) {
            var base64DataString = url.parse(base64Prefix + fixtureData);
            dataReader(base64DataString).then(function (readResult) {
                temp.track();

                var readStream = readResult.stream(),
                    writeTemp = temp.path({ suffix: '.png'});

                readStream.on('end', function () {
                    gm.compare(writeTemp, fixture.fullFixturePath(fixturePath), function (err, isEqual) {
                        if (err) {
                            reject(err);
                        } else {
                            temp.cleanup(function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(isEqual);
                                }
                            });
                        }
                    });
                });
                readStream.pipe(fs.createWriteStream(writeTemp), {
                    end: true
                });
            }).catch(reject);
        }).catch(reject);
    });
};

describe('base64 data reader', function () {
    it('tests if streamed image/png base64 equals expected output', function (done) {
        compareDataFixtures('data:image/png;base64,', 'images/base64.png.base64', 'images/base64.png').then(function (equal) {
            if (equal) {
                done();
            } else {
                done('Not equal');
            }
        }).catch(function (err) {
            done(new Error(JSON.stringify(err)));
        });
    });
    it('tests if streamed image/gif base64 equals expected output', function (done) {
        compareDataFixtures('data:image/gif;base64,', 'images/base64.gif.base64', 'images/base64.gif').then(function (equal) {
            if (equal) {
                done();
            } else {
                done('Not equal');
            }
        }).catch(function (err) {
            done(new Error(JSON.stringify(err)));
        });
    });
    it('tests if unsupported data-uri (text/plain) rejects', function (done) {
        compareDataFixtures('data:text/plain;charset=US-ASCII;base64,', 'images/base64.gif.base64', 'images/base64.gif').then(function () {
            assert.fail('Shouldn\'t process unsupported data-uri');
        }).catch(function () {
            assert(true);
            done();
        });
    });
});
