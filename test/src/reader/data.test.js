const url = require('url');
const temp = require('temp');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const assert = require('assert');

const dataReader = require('../../../src/reader/data');
const DATA_IMAGE_URI = 'data:image/png;base64,';
const DATA_HTML_URI = 'data:text/html;charset=utf-8,';
const RED_DOT_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

describe('data reader', function () {
  it('resolves the expected result', function (done) {
    var op = new FlamingoOperation();
    op.input = url.parse(DATA_IMAGE_URI + RED_DOT_DATA);
    dataReader(op).then(function (data) {
      assert.ok(!!data.stream);
      const buf = [];
      const out = temp.createWriteStream();

      return data.stream().then(function (stream) {
        stream.on('data', function (e) {
          buf.push(e);
        });
        stream.on('end', function () {
          assert.equal(Buffer.concat(buf).toString('base64'),
            RED_DOT_DATA);
          done();
        });
        stream.pipe(out);
      });
    }).catch(function (err) {
      assert.fail(err);
    });
  });
  it('rejects for not image data uri', function (done) {
    var op = new FlamingoOperation();
    op.input = url.parse(DATA_HTML_URI + RED_DOT_DATA);
    dataReader(op).then(function () {
      done('shouldn\'t resolve');
    }, function () {
      done();
    });
  });
});
