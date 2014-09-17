/* global describe, it */

var fixture = require('../../test-util/fixture'),
    gm = require('gm'),
    temp = require('temp'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    RSVP = require('rsvp'),
    fileReader = require('../../../src/reader/file'),
    assert = require('assert');

var compareFileFixtures = function (fixturePath) {
    return new RSVP.Promise(function (resolve, reject) {
        const TEST_WHITELIST = ['/tmp', path.resolve(__dirname, '../../')];
        fileReader(url.parse('file://' + fixture.fullFixturePath(fixturePath)), TEST_WHITELIST).then(function (readResult) {
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
                        resolve(isEqual);
                    }
                });
            });
            readStream.pipe(fs.createWriteStream(writeTemp), {
                end: true
            });
        }).catch(reject);
    });
};

describe('file reader', function () {
    it('tests if streamed png file equals expected output', function (done) {
        compareFileFixtures('images/base64.png').then(function (equal) {
            if (equal) {
                done();
            } else {
                done('Not equal');
            }
        }).catch(function (err) {
            done(new Error(JSON.stringify(err)));
        });
    });
    it('tests if streamed gif file equals expected output', function (done) {
        compareFileFixtures('images/base64.gif').then(function (equal) {
            if (equal) {
                done();
            } else {
                done('Not equal');
            }
        }).catch(function (err) {
            done(new Error(JSON.stringify(err)));
        });
    });
    it('tests if streamed markdown file is rejected', function (done) {
        compareFileFixtures('docs/some-file.md').then(function () {
            assert.fail('shouldn\'t reached this code');
        }).catch(function () {
            done();
        });
    });
    it('tests if the reader rejects if file doesn\'t exist', function (done) {
        var fileUrl  = url.parse('file://' + fixture.fullFixturePath('NON-EXISTANT-FILE'));
        fileReader(fileUrl, [path.resolve(__dirname, '../../')]).then(function () {
            assert.fail('shouldn\'t reached this code');
        }).catch(function () {
            done();
        });
    });
});
