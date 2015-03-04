var assert = require('assert');

describe('env-parser', function () {
    var envConfig = require('../../../src/util/env-config'),
        envParser = require('../../../src/util/env-parser');

    it('checks that the basic overwriting works', function () {
        var conf = {EXISTING: {PATH: 'wasd'}, OBJ: { EXISTING: 'fdsa' }},
            env = {FOO: 'bar', OBJ_PATH: '42', OBJ_FOO_BAR: 'true', OBJ_EXISTING: 'asdf'};

        assert.deepEqual(envConfig(conf, env, [
            ['FOO', 'FOO'],
            ['OBJ_PATH', 'OBJ.PATH', envParser.int(0)],
            ['OBJ_FOO_BAR', 'OBJ.FOO.BAR', envParser.boolean],
            ['OBJ_EXISTING', 'OBJ.EXISTING'],
            ['EXISTING_PATH', 'EXISTING.PATH'],
            ['SOME_FIELD', 'SOME.FIELD']
        ]), {
            FOO: 'bar',
            EXISTING: { PATH: 'wasd' },
            OBJ: {
                PATH: 42,
                FOO: { BAR: true },
                EXISTING: 'asdf'
            }
        });
    });
});
