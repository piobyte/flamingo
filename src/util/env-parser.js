/* @flow weak */
/**
 * Environment value parser module
 * @module flamingo/src/util/env-parser
 */

module.exports = {
  /**
   * Convert a value to a boolean
   * @param {*} val value to convert
   * @returns {boolean} true if val equals "true"
   * @example
   * parser.boolean('true') // true
   * parser.boolean('false') // false
   * parser.boolean('123') // false
   */
  boolean: function (val/*: string*/)/*: boolean */ {
    return val === 'true';
  },
  /**
   * Create a function that calls `parseInt(_, 10)` and handles `NaN` by returning a given default value.
   * @param {number} def default value in case of non number
   * @returns {Function} function to convert a value to a number
   * @example
   * parser.int(200)('100') // 100
   * parser.int(42)('wasd') // 42
   */
  int: function (def/*: number*/)/*: function */ {
    return function (val/*: any*/)/*: number*/ {
      var parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        parsed = def;
      }
      return parsed;
    };
  },
  /**
   * @param {String} field Object field to parse
   * @param {number} def Default value in case of NaN
   * @returns {Function} Function to convert an object to a number
   * @example
   * parser.objectInt('width', 200)({height: 100}); //200
   * parser.objectInt('height', 200)({height: 100}); //100
   */
  objectInt: function (field/*: string */, def/*: number*/) {
    return function (obj/*: {} */)/*: number*/ {
      return module.exports.int(def)(obj[field]);
    };
  },
  /**
   * Convert a value to a Buffer
   * @param {*} val value to convert
   * @returns {Buffer} value as Buffer
   * @example
   * parser.buffer('_ag3WU77') // new Buffer('_ag3WU77')
   */
  buffer: function (val/*: string */) {
    return new Buffer(val);
  },
  /**
   * Convert a value to a base64 Buffer
   * @param {*} val value to convert
   * @returns {Buffer} value as Buffer
   * @example
   * parser.buffer64('DjiZ7AWTeNh38zoQiZ76gw==') // new Buffer('DjiZ7AWTeNh38zoQiZ76gw==', 'base64')
   */
  buffer64: function (val/*: string */) {
    return new Buffer(val, 'base64');
  }
};
