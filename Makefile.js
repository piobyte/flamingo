#!/usr/bin/env node
/* global target, echo, find, exit */

require('shelljs/make');

/**
 * Generates a function that matches files with a particular extension.
 * @param {string} extension The file extension (i.e. "js")
 * @returns {Function} The function to pass into a filter method.
 * @private
 */
function fileType(extension) {
    return function (filename) {
        return filename.substring(filename.lastIndexOf('.') + 1) === extension;
    };
}

function endsWith(ends) {
    return function (fileName) {
        return fileName.indexOf(ends) === fileName.length - ends.length;
    };
}

var path = require('path'),
    nodeCLI = require('shelljs-nodecli'),
    benchrest = require('bench-rest'),
    forever = require('forever-monitor'),
    conf = require('./config'),
    benchFlows = require('./test/fixtures/bench-flows');

var NODE = 'node',
    NODE_MODULES = './node_modules/',
    MAKEFILE = './Makefile.js',
    ESLINT = NODE_MODULES + 'eslint/bin/eslint.js',
    ISTANBUL = 'istanbul',
    MOCHA = NODE_MODULES + 'mocha/bin/_mocha',

    JS_FILES = find('src/').filter(fileType('js'))
        .concat('index.js')
        .concat('config.js')
        .join(' '),
    TEST_FILES = find('test/').filter(fileType('js')).filter(endsWith('.test.js')).join(' ');

target.all = function () {
    target.test();
};

target.lint = function () {
    var errors = 0,
        lastReturn;

    echo('Validating Makefile.js');
    lastReturn = nodeCLI.exec(ESLINT, '-c eslint.json', MAKEFILE);
    if (lastReturn.code !== 0) { errors++; }

    echo('Validating JavaScript files');
    lastReturn = nodeCLI.exec(ESLINT, '-c eslint.json', JS_FILES);
    if (lastReturn.code !== 0) { errors++; }

    echo('Validating JavaScript test files');
    lastReturn = nodeCLI.exec(ESLINT, '-c eslint.json', TEST_FILES);
    if (lastReturn.code !== 0) { errors++; }
    if (errors) { exit(1); }
};

target.test = function () {
    var errors = 0,
        lastReturn;
    target.lint();

    echo('Generating coverage');
    lastReturn = nodeCLI.exec(ISTANBUL, 'cover', MOCHA, '-- -R tap -c', TEST_FILES);
    if (lastReturn.code !== 0) { errors++; }

    echo('Checking coverage');
    lastReturn = nodeCLI.exec(ISTANBUL, 'check-coverage', '--statement 99 --branch 98 --function 99 --lines 99');
    if (lastReturn.code !== 0) { errors++; }
    if (errors) { exit(1); }
};

target.perf = function () {
    var server = new forever.Monitor('index.js', {
        max: 1,
        silent: true
    });
    server.on('exit', function () {
        echo('Performance test server exit');
    });
    server.on('start', function () {
        echo('Performance test server started');
    });
    server.on('stdout', function (data) {
        // convert buffer to string
        var msg = data.toString('utf-8'),
            parsedMsg;
        try {
            parsedMsg = JSON.parse(msg);
            if (parsedMsg.msg.indexOf('Server listening') === 0) {
                // ready for testing
                var flow = {
                        main: benchFlows
                    },
                    runOptions = {
                        limit: 10, iterations: 100
                    };
                benchrest(flow, runOptions)
                    .on('error', function (err, ctxName) {
                        console.error('Failed in %s with err: ', ctxName, err);
                        server.stop();
                    })
                    .on('end', function (stats, errorCount) {
                        echo('error count: ', errorCount);
                        echo(JSON.stringify(stats));
                        server.stop();
                    });
            }
        } catch (e) {
        }
    });
    server.start();
};
