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

  describe('#objectInt()', function(){
    var objectInt = envParser.objectInt;
    it('converts an object field to an integer number', function(){
      assert.equal(objectInt('width', 200)({width: 100}), 100);
    });
    it('returns default for bad inputs', function(){
      assert.equal(objectInt('width', 200)({height: 100}), 200);
      assert.equal(objectInt('width', 200)({}), 200);
      assert.equal(objectInt('width', 200)(null), 200);
      assert.equal(objectInt('width', 200)(''), 200);
    });
  });

  describe('#buffer64()', function(){
    var buffer = envParser.buffer64;
    it('wraps the input in a base64 buffer', function(){
      assert.ok(compareFunction(new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64'),
        buffer('DjiZ7AWTeNh38zoQiZ76gw==')));
    });
  });

  describe('#buffer()', function(){
    var buffer = envParser.buffer;
    it('wraps the input in a buffer', function(){
      assert.ok(compareFunction(new Buffer('wasd'),
        buffer('wasd')));
    });
  });

  describe('#int()', function(){
    var int = envParser.int;
    it('converts a boolean string to an integer number', function(){
      assert.equal(int(42)('9000'), 9000);
      assert.equal(int(42)('0'), 0);
      assert.equal(int(42)('-9000'), -9000);
    });
    it('returns default for bad inputs', function(){
      assert.equal(int(42)(), 42);
      assert.equal(int(42)(null), 42);
      assert.equal(int(42)('foo'), 42);
      assert.equal(int(42)(false), 42);
    });
  });

  describe('#boolean()', function(){
    var boolean = envParser.boolean;
    it('converts a boolean string to a boolean', function(){
      assert.equal(boolean('true'), true);
      assert.equal(boolean('false'), false);
    });
    it('returns false for bad inputs', function(){
      assert.equal(boolean('false'), false);
      assert.equal(boolean(true), false);
      assert.equal(boolean(), false);
      assert.equal(boolean('wasd'), false);
      assert.equal(boolean('123'), false);
    });
  });

  describe('#float()', function(){
    var float = envParser.float;
    it('converts a float string to a float number', function(){
      assert.equal(float(0)('3.14'), 3.14);
      assert.equal(float(0)('0.33'), 0.33);
      assert.equal(float(0)('-42.1'), -42.1);
    });
    it('returns default for bad inputs', function(){
      assert.equal(float(1)('foo'), 1);
      assert.equal(float(1)(), 1);
      assert.equal(float(1)(false), 1);
      assert.equal(float(1)(null), 1);
    });
  });
});
