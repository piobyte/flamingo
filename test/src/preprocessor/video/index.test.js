const assert = require('assert');
const temp = require('temp');
const path = require('path');
const {FILE} = require('../../../../src/model/reader-type');

describe('video preprocessor', function () {
  before(() => temp.track());
  after((done) => temp.cleanup(done));

  const videoProcessor = require('../../../../src/preprocessor/video/index');
  const FlamingoOperation = require('../../../../src/model/flamingo-operation');

  it('should work without throwing an error', function () {
    const op = new FlamingoOperation();
    const VIDEO_FILE = path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg');
    const readResult = {
      stream: function () {
        throw 'shouldn\'t call the stream function on a file';
      },
      path: VIDEO_FILE,
      type: FILE
    };

    op.preprocessorConfig = {
      seekPercent: .1
    };
    op.config = {
      PREPROCESSOR: {
        VIDEO: {
          KILL_TIMEOUT: 10 * 1000
        }
      }
    };

    return videoProcessor(op)(readResult).then(function (stream) {
      assert.equal(typeof stream.pipe, 'function');
    });
  });
});
