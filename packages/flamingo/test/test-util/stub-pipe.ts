import sinon = require("sinon");
import noop = require("lodash/noop");

type Pipe = { [key: string]: (...any) => any };
type PipeMethod = [string, any[], any[]] | [string, any[]] | [string];

function buildPipe(fields: string[]): Pipe {
  return fields.reduce((pipe, fieldName) => {
    pipe[fieldName] = noop;
    return pipe;
  }, {});
}

function stubPipe(pipe: Pipe, methods: PipeMethod[]) {
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
