#!/usr/bin/env node
/* global target, echo, find, exit, exec, which */

require('shelljs/make');

var partialRight = require('lodash/function/partialRight'),
    endsWith = require('lodash/string/endsWith'),
    ary = require('lodash/function/ary'),
    some = require('lodash/collection/some'),
    pkg = require('./package.json');

function ends(val) { return ary(partialRight(endsWith, val), 1); }

var MAKEFILE = './make.js',
    ISTANBUL = './node_modules/istanbul/lib/cli.js',
    ESLINT = './node_modules/eslint/bin/eslint.js',
    MOCHA = './node_modules/mocha/bin/_mocha',
    JSDOC = './node_modules/jsdoc/jsdoc.js',
    FLOW = 'flow',

    JS_FILES = find('src/').filter(ends('.js')).concat('index.js', 'config.js').join(' '),
    TEST_FILES = find('test/').filter(ends('.test.js')).join(' ');

target.all = function () {
    target.test();
    target.docs();
};

target.lint = function () {
    if (some([
        exec(ESLINT + ' ' + MAKEFILE).code,
        exec(ESLINT + ' ' + JS_FILES).code,
        exec(ESLINT + ' ' + TEST_FILES).code
    ])) {
        exit(1);
    }
};

target['type-check'] = function () {
    if(!which(FLOW)) {
        echo('flow command not available, skipping type checking');
    } else {
        if (some([
            exec(FLOW + ' check').code
        ])) {
            exit(1);
        }
    }
};

target.test = function () {
    target.lint();
    target['type-check']();
    if (some([
        exec(ISTANBUL + ' cover ' + MOCHA + ' -- -b -R tap -c ' + TEST_FILES).code,
        exec(ISTANBUL + ' check-coverage --statement 99 --branch 98 --function 99 --lines 99').code
    ])) {
        exit(1);
    }
};

target.docs = function () {
    if (some([
        exec(JSDOC + ' ' + JS_FILES + ' --template node_modules/jsdoc-baseline --package package.json -R README.md -d docs').code
    ])) {
        exit(1);
    }
};

target.help = function () {
    echo(pkg.name + '@' + pkg.version);
    echo(pkg.description);
    echo();
    echo('available `node make` targets:');
    Object.keys(target).forEach(function (targetKey) {
        echo('\t' + targetKey);
    });
};

target.bench = require('./targets/bench');
