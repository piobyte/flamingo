/* global describe, it */

var fixture = require('../../test-util/fixture'),
  gm = require('gm'),
  temp = require('temp'),
  path = require('path'),
  url = require('url'),
  fs = require('fs'),
  Promise = require('rsvp').Promise,
  fileReader = require('../../../src/reader/file'),
  FlamingoOperation = require('../../../src/util/flamingo-operation'),
  assert = require('assert');

var compareFileFixtures = function (fixturePath, deprecatedApi) {
  return new Promise(function (resolve, reject) {
    var TEST_WHITELIST = {FILE: {READ: ['/tmp', path.resolve(__dirname, '../../')]}};

    var op = new FlamingoOperation();
    op.targetUrl = url.parse('file://' + fixture.fullFixturePath(fixturePath));
    op.config = {
      ACCESS: TEST_WHITELIST
    };

    (deprecatedApi ? fileReader(url.parse('file://' + fixture.fullFixturePath(fixturePath)), TEST_WHITELIST) : fileReader(op)).then(function (readResult) {
      temp.track();

      var readStream = readResult.stream(),
        writeTemp = temp.path({suffix: '.png'});

      readStream.on('end', function () {
        gm.compare(writeTemp, fixture.fullFixturePath(fixturePath), function (err, isEqual) {
          if (err) {
            reject(err);
          } else {
            temp.cleanup(function (tmpErr) {
              if (tmpErr) {
                reject(tmpErr);
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
    var op = new FlamingoOperation();

    op.targetUrl = url.parse('file://' + fixture.fullFixturePath('NON-EXISTANT-FILE'));
    op.config = {
      ACCESS: {FILE: {READ: [path.resolve(__dirname, '../../')]}}
    };

    fileReader(op).then(function () {
      assert.fail('shouldn\'t reached this code');
    }).catch(function () {
      done();
    });
  });

  describe('deprecated no-flamingo-operation', function(){
    it('tests if streamed png file equals expected output', function (done) {
      compareFileFixtures('images/base64.png', true).then(function (equal) {
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
      compareFileFixtures('images/base64.gif', true).then(function (equal) {
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
      compareFileFixtures('docs/some-file.md', true).then(function () {
        assert.fail('shouldn\'t reached this code');
      }).catch(function () {
        done();
      });
    });
    it('tests if the reader rejects if file doesn\'t exist', function (done) {
      var fileUrl = url.parse('file://' + fixture.fullFixturePath('NON-EXISTANT-FILE'));
      fileReader(fileUrl, {FILE: {READ: [path.resolve(__dirname, '../../')]}}).then(function () {
        assert.fail('shouldn\'t reached this code');
      }).catch(function () {
        done();
      });
    });
  });
});
