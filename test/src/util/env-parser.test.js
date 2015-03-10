var assert = require('assert');

// @via https://github.com/substack/node-buffer-equal#
var compareFunction = function (bufA, bufB) {
    /*eslint curly:0,no-else-return:0 */
    if (!bufA.compare) {
        if (!Buffer.isBuffer(bufA)) return undefined;
        if (!Buffer.isBuffer(bufB)) return undefined;
        if (typeof bufA.equals === 'function') return bufA.equals(bufB);
        if (bufA.length !== bufB.length) return false;

        for (var i = 0; i < bufA.length; i++) {
            if (bufA[i] !== bufB[i]) return false;
        }

        return true;
    } else {
        return bufA.compare(bufB) === 0;
    }
};

describe('env-parser', function () {
    var envParser = require('../../../src/util/env-parser');

    it('checks that the boolean parser works', function () {
        assert.equal(envParser.boolean('true'), true);

        assert.equal(envParser.boolean('false'), false);
        assert.equal(envParser.boolean(), false);
        assert.equal(envParser.boolean('wasd'), false);
        assert.equal(envParser.boolean('123'), false);
    });

    it('checks that the int parser works', function () {
        assert.equal(envParser.int(42)('9000'), 9000);
        assert.equal(envParser.int(42)(), 42);
    });

    it('checks that the buffer parser works', function () {
        assert.ok(compareFunction(new Buffer('wasd'), envParser.buffer('wasd')));
    });

    it('checks that the buffer base64 parser works', function () {
        assert.ok(compareFunction(new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64'), envParser.buffer64('DjiZ7AWTeNh38zoQiZ76gw==')));
    });

    it('checks that the objectList parser works', function () {
        assert.deepEqual(envParser.objectList('id')('id:foo,bar:baz,lorem:ipsum'), {
            foo: {
                bar: 'baz',
                lorem: 'ipsum'
            }
        });
        assert.deepEqual(envParser.objectList('id')('id:foo,bar:baz;id:foo2,key:val'), {
            foo: {
                bar: 'baz'
            },
            foo2: {
                key: 'val'
            }
        });
        assert.deepEqual(envParser.objectList('id')('id:foo,bar:baz;'), {
            foo: {
                bar: 'baz'
            }
        });
    });
});
