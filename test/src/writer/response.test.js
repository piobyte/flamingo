/* global describe, it */

var temp = require('temp'),
  fs = require('fs'),
  path = require('path');

var responseWriter = require('../../../src/writer/response'),
  FlamingoOperation = require('../../../src/util/flamingo-operation');

describe('response writer', function () {
  it('passes the stream to the reply function', function (done) {

    var op = new FlamingoOperation(),
      stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png')),
      replyStream = temp.createWriteStream();

    op.reply = function (stream) {
      return stream.pipe(replyStream);
    };

    responseWriter(op)(stream).then(function () {
      done();
    }).catch(done);
  });

  describe('deprecated no-flamingo-operation', function () {
    it('passes the stream to the reply function', function (done) {

      var stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png')),
        replyStream = temp.createWriteStream(),
        reply = function (stream) {
          return stream.pipe(replyStream);
        };

      responseWriter(null, reply, {})(stream).then(function () {
        done();
      }).catch(done);
    });

  });
});
