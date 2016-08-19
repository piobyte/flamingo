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
const {InvalidInputError} = require('../../../src/util/errors');

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

  it('rejects on input stat error', function(){
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, 'NON-EXISTANT-FILE'));
    op.config = {
      ACCESS: {FILE: {READ: [path.join(__dirname)]}}
    };

    return fileReader(op).catch((e) => {
      assert.ok(e instanceof InvalidInputError);
      assert.equal(e.message, 'Input stat error.');
    });
  });

  it('rejects on input not being a file', function(){
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, '../reader'));
    op.config = {
      ACCESS: {FILE: {READ: [path.join(__dirname, '..')]}}
    };

    return fileReader(op).catch((e) => {
      assert.ok(e instanceof InvalidInputError);
      assert.equal(e.message, 'Input isn\'t a file.');
    });
  });

  it('rejects if input access isn\'t allowed', function(){
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, 'file.test.js'));
    op.config = {
      ACCESS: {FILE: {READ: [path.join(__dirname, 'dir')]}}
    };

    return fileReader(op).catch((e) => {
      assert.ok(e instanceof InvalidInputError);
      assert.ok(e.extra instanceof url.Url);
      assert.equal(e.message, 'File access not allowed.');
    });
  });
});
