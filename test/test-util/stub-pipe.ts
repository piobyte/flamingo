import sinon = require('sinon');
import noop = require('lodash/noop');

function buildPipe(fields = []) {
  return fields.reduce((pipe, fieldName) => {
    pipe[fieldName] = noop;
    return pipe;
  }, {});
}

function stubPipe(pipe, methods = []) {
  methods.forEach(stubInstruction => {
    const [method, ...argsReturn] = stubInstruction;

    const stub = sinon.stub(pipe, method);
    if (argsReturn.length) {
      argsReturn.forEach(args => {
        stub.withArgs(...args).returns(pipe);
      });
    } else {
      stub.returns(pipe);
    }
  });
}

export = {
  stubPipe,
  buildPipe
};
