var temp = require('temp'),
  fs = require('fs'),
  assert = require('assert'),
  assign = require('lodash/object/assign');

describe('logger', function () {
  var logger = require('../../src/logger');

  it('checks that the method calls the stream function', function (done) {
    var tempPath = temp.path({suffix: '.log'}),
      loggerName = 'test:logger.addStreams',
      LOG_MESSAGE = 'Time is an illusion. Lunchtime doubly so.',
      log;

    logger.addStreams([{
      level: 'fatal',
      path: tempPath
    }]);

    log = logger.build(loggerName);
    log.fatal(LOG_MESSAGE);

    fs.readFile(tempPath, function (err, data) {
      if (err) {
        done(err);
      }

      var logData = JSON.parse(data.toString('utf8'));
      assert.equal(logData.msg, LOG_MESSAGE);
      done();
    });
  });

  it('serializes request log objects', function () {
    var REQUEST = {
        headers: 'headers',
        path: '/foo',
        route: {
          path: '/foo',
          method: 'get'
        },
        method: 'get'
      },
      serialized = logger.serializers.request(assign({}, REQUEST, {
        SOME_WEIRD_EXTRA_FIELD: 'bar'
      }));

    assert.deepEqual(serialized, REQUEST);
    assert.ok(logger.serializers.request('foo'), 'it doesn\'t break on invalid input');
  });

  it('serializes request error objects', function () {
    /* eslint no-underscore-dangle: 0 */
    var err;
    try {
      JSON.parse('foo');
    } catch (e) {
      err = e;
    }

    // check if the serialized object has the stack property
    assert.ok(logger.serializers.error(err).hasOwnProperty('stack'));
    assert.ok(logger.serializers.error(2)._serializerError.length > 0, 'won\'t break on non error objects');
    assert.ok(logger.serializers.error(NaN)._serializerError.length > 0, 'won\'t break on non error objects');
  });

  it('serializes request error strings', function () {
    /* eslint no-underscore-dangle: 0 */

    assert.deepEqual(logger.serializers.error('pls halp'), {message: 'pls halp'});
  });
});
