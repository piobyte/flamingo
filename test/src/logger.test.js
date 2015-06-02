var temp = require('temp'),
    fs = require('fs'),
    assert = require('assert');

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
            if (err) { done(err); }

            var logData = JSON.parse(data.toString('utf8'));
            assert.equal(logData.msg, LOG_MESSAGE);
            done();
        });
    });
});
