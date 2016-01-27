/* disabled flow because of deprecated signature type mismatch */
/**
 * Image processor module
 * @module flamingo/src/processor/image
 */
var deprecate = require('../../util/deprecate'),
  noop = require('lodash/noop');

var processors = {
  sharp: require('./sharp'),
  gm: require('./gm')
};

/**
 * Function that takes an array with processing operations and returns a function that can be called with an stream.
 * This stream is converted using the given transformations array.
 *
 * @param {Object} operation flamingo operation
 * @returns {Function} function to convert a stream
 * @example
 * image([{ processor: 'sharp', pipe: (sharp) => sharp.toFormat('jpeg') }])(fs.createReadStream('sample.png')
 * // converted image stream
 */
module.exports = function (operation/*: FlamingoOperation */)/*: function */ {
  var transformations;

  if (arguments.length === 2) {
    deprecate(noop, 'image processor called without passing the flamingo operation object.', {id: 'no-flamingo-operation'});
    var config = arguments[1];
    transformations = arguments[0];

    return function (stream) {
      for (var i = 0; i < transformations.length; i++) {
        stream = processors[transformations[i].processor](transformations[i].pipe, stream, config);
      }
      return stream;
    };
  } else {
    transformations = operation.profile.process;

    return function (stream) {
      for (var i = 0; i < transformations.length; i++) {
        stream = processors[transformations[i].processor](operation, transformations[i].pipe, stream);
      }
      return stream;
    };
  }
};
