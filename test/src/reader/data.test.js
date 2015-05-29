/* global describe, it */

var url = require('url'),
    temp = require('temp'),
    assert = require('assert');

var dataReader = require('../../../src/reader/data');
var DATA_IMAGE_URI = 'data:image/png;base64,',
    DATA_HTML_URI = 'data:text/html;charset=utf-8,',
    RED_DOT_DATA = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

describe('data reader', function () {
    it('resolves the expected result', function (done) {
        dataReader(url.parse(DATA_IMAGE_URI + RED_DOT_DATA)).then(function (data) {
            assert.ok(!!data.stream);
            var buf = [],
                out = temp.createWriteStream();

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
        dataReader(url.parse(DATA_HTML_URI + RED_DOT_DATA)).then(function () {
            done('shouldn\'t resolve');
        }, function () {
            done();
        });
    });
});
