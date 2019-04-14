import gm = require('gm');
import temp = require('temp');
import path = require('path');
import url = require('url');
import fs = require('fs');
import assert = require('assert');

import fixture = require('../../test-util/fixture');
import fileReader = require('../../../src/reader/file');
import FlamingoOperation = require('../../../src/model/flamingo-operation');
import errors = require('../../../src/util/errors');

const { InvalidInputError } = errors;
const compareFileFixtures = function(fixturePath) {
  return new Promise(function(resolve, reject) {
    const TEST_WHITELIST = {
      FILE: { READ: ['/tmp', path.resolve(__dirname, '../../')] }
    };

    const op = new FlamingoOperation();
    op.input = url.parse('file://' + fixture.fullFixturePath(fixturePath));
    op.config = {
      ACCESS: TEST_WHITELIST
    };

    fileReader(op)
      .then(function(readResult) {
        temp.track();

        const readStream = readResult.stream();
        const writeTemp = temp.path({ suffix: '.png' });

        readStream.on('end', function() {
          gm.compare(writeTemp, fixture.fullFixturePath(fixturePath), function(
            err,
            isEqual
          ) {
            if (err) {
              reject(err);
            } else {
              temp.cleanup(function(tmpErr) {
                /* istanbul ignore next */
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
        readStream.pipe(
          fs.createWriteStream(writeTemp),
          {
            end: true
          }
        );
      })
      .catch(reject);
  });
};

describe('file reader', function() {
  it('tests if streamed png file equals expected output', function() {
    return compareFileFixtures('images/base64.png');
  });
  it('tests if streamed gif file equals expected output', function() {
    return compareFileFixtures('images/base64.gif');
  });
  it('tests if streamed markdown file is rejected', async function() {
    /* istanbul ignore next */
    try {
      await compareFileFixtures('docs/some-file.md');
      assert.ok(false, "shouldn't reached this code");
    } catch {
      assert.ok(true);
    }
  });

  it('rejects on input stat error', async function() {
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, 'NON-EXISTENT-FILE'));
    op.config = {
      ACCESS: { FILE: { READ: [path.join(__dirname)] } }
    };

    try {
      await fileReader(op);
      assert.fail('should throw');
    } catch (e) {
      assert.ok(e instanceof Error);
    }
  });

  it('rejects on input not being a file', function() {
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, '../reader'));
    op.config = {
      ACCESS: { FILE: { READ: [path.join(__dirname, '..')] } }
    };

    return fileReader(op).catch(e => {
      assert.ok(e instanceof InvalidInputError);
      assert.ok(e.message.includes("Input isn't a file"));
    });
  });

  it("rejects if input access isn't allowed", function() {
    const op = new FlamingoOperation();
    op.input = url.parse('file://' + path.join(__dirname, 'file.test.js'));
    op.config = {
      ACCESS: { FILE: { READ: [path.join(__dirname, 'dir')] } }
    };

    return fileReader(op).catch(e => {
      assert.ok(e instanceof InvalidInputError);
      // TODO: protocol file: ??
      assert.ok(e.message.includes('File access not allowed'));
    });
  });
});
