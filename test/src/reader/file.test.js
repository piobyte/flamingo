const fixture = require('../../test-util/fixture');
const gm = require('gm');
const temp = require('temp');
const path = require('path');
const url = require('url');
const fs = require('fs');
const Promise = require('bluebird');
const fileReader = require('../../../src/reader/file');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const assert = require('assert');

const compareFileFixtures = function (fixturePath) {
  return new Promise(function (resolve, reject) {
    const TEST_WHITELIST = {FILE: {READ: ['/tmp', path.resolve(__dirname, '../../')]}};

    const op = new FlamingoOperation();
    op.input = url.parse('file://' + fixture.fullFixturePath(fixturePath));
    op.config = {
      ACCESS: TEST_WHITELIST
    };

    fileReader(op).then(function (readResult) {
      temp.track();

      const readStream = readResult.stream();
      const writeTemp = temp.path({suffix: '.png'});

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
  it('tests if streamed png file equals expected output', function () {
    return compareFileFixtures('images/base64.png');
  });
  it('tests if streamed gif file equals expected output', function () {
    return compareFileFixtures('images/base64.gif');
  });
  it('tests if streamed markdown file is rejected', function () {
    compareFileFixtures('docs/some-file.md')
      .then(() => assert.fail('shouldn\'t reached this code'))
      .catch(() => assert.ok(true));
  });
  it('tests if the reader rejects if file doesn\'t exist', function () {
    const op = new FlamingoOperation();

    op.input = url.parse('file://' + fixture.fullFixturePath('NON-EXISTANT-FILE'));
    op.config = {
      ACCESS: {FILE: {READ: [path.resolve(__dirname, '../../')]}}
    };

    return fileReader(op)
      .then(() => assert.fail('shouldn\'t reached this code'))
      .catch(() => assert.ok(true));
  });
});
