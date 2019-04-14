import assert = require('assert');
import errors = require('../../../src/util/errors');

const { InvalidInputError, ProcessingError } = errors;
describe('errors', function() {
  it('InvalidInputError', function() {
    assert.throws(() => {
      throw new InvalidInputError('invalid input message');
    }, InvalidInputError);
  });

  it('ProcessingError', function() {
    assert.throws(() => {
      throw new ProcessingError('processing error');
    }, ProcessingError);
    assert.throws(
      () => {
        throw new ProcessingError('processing error');
      },
      error => {
        const isCorrectError = error instanceof ProcessingError;
        const hasCorrectMessage = error.message === 'processing error';

        return isCorrectError && hasCorrectMessage;
      }
    );
  });
});
