var assert = require('assert');

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
        assert.equal(new Buffer('wasd').compare(envParser.buffer('wasd')), 0);
    });

    it('checks that the buffer base64 parser works', function () {
        assert.equal(new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64').compare(envParser.buffer64('DjiZ7AWTeNh38zoQiZ76gw==')), 0);
    });

    it('checks that the buffer objectList parser works', function () {
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
