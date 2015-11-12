var assert = require('assert'),
  temp = require('temp'),
  path = require('path');

describe('video preprocessor', function () {
  before(function () {
    temp.track();
  });
  after(function (done) {
    temp.cleanup(done);
  });

  var videoProcessor = require('../../../../src/preprocessor/video/index'),
    FlamingoOperation = require('../../../../src/util/flamingo-operation');

  it('should work without throwing an error', function (done) {
    var op = new FlamingoOperation(),
      VIDEO_FILE = path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg'),
      readResult = {
        stream: function(){
          throw 'shouldn\'t call the stream function on a file';
        },
        path: VIDEO_FILE,
        type: 'file'
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

    var process = videoProcessor(op);
    process(readResult).then(function(stream){
      assert.equal(typeof stream.pipe, 'function');
      done();
    }).catch(done);
  });

  describe('deprecated no-flamingo-operation', function () {
    it('should work without throwing an error', function (done) {
      var VIDEO_FILE = path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg'),
        readResult = {
          stream: function(){
            throw 'shouldn\'t call the stream function on a file';
          },
          path: VIDEO_FILE,
          type: 'file'
        };

      var process = videoProcessor({
        seekPercent: .1
      }, {
        PREPROCESSOR: {
          VIDEO: {
            KILL_TIMEOUT: 10 * 1000
          }
        }
      });
      process(readResult).then(function(stream){
        assert.equal(typeof stream.pipe, 'function');
        done();
      }).catch(done);
    });
  });
  describe('deprecated no-global-config', function () {
    it('should work without throwing an error', function (done) {
      var VIDEO_FILE = path.join(__dirname, '../../../fixtures/videos/trailer_1080p.ogg'),
        readResult = {
          stream: function(){
            throw 'shouldn\'t call the stream function on a file';
          },
          path: VIDEO_FILE,
          type: 'file'
        };

      var process = videoProcessor({seekPercent: .1});
      process(readResult).then(function(stream){
        assert.equal(typeof stream.pipe, 'function');
        done();
      }).catch(done);
    });
  });
});
