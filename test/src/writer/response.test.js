const temp = require('temp');
const fs = require('fs');
const path = require('path');

const responseWriter = require('../../../src/writer/response');
const FlamingoOperation = require('../../../src/model/flamingo-operation');

describe('response writer', function () {
  it('passes the stream to the reply function', function (done) {

    const op = new FlamingoOperation();
    const stream = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    const replyStream = temp.createWriteStream();

    op.reply = function (stream) {
      return stream.pipe(replyStream);
    };

    responseWriter(op)(stream).then(function () {
      done();
    }).catch(done);
  });
});
