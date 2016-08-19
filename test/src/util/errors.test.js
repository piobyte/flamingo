const assert = require('assert');
const {
  InvalidInputError,
  ProcessingError
} = require('../../../src/util/errors');

describe('errors', function () {
  it('InvalidInputError', function () {
    assert.throws(() => {
      throw new InvalidInputError('invalid input message');
    }, InvalidInputError);
    assert.throws(() => {
      throw new InvalidInputError('invalid input message', {foo: 'bar'});
    }, (error) => {
      const isCorrectError = error instanceof InvalidInputError;
      const hasCorrectMessage = error.message === 'invalid input message';
      const hasCorrectExtra = error.extra.foo === 'bar';

      return isCorrectError && hasCorrectExtra && hasCorrectMessage;
    });
  });

  it('ProcessingError', function () {
    assert.throws(() => {
      throw new ProcessingError('processing error');
    }, ProcessingError);
    assert.throws(() => {
      throw new ProcessingError('processing error', {foo: 'bar'});
    }, (error) => {
      const isCorrectError = error instanceof ProcessingError;
      const hasCorrectMessage = error.message === 'processing error';
      const hasCorrectExtra = error.extra.foo === 'bar';

      return isCorrectError && hasCorrectExtra && hasCorrectMessage;
    });
  });
});
