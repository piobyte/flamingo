const assert = require('assert');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const Promise = require('bluebird');
const sinon = require('sinon');
const Convert = require('../../../src/mixins/convert');
const fs = require('fs');
const path = require('path');

function failOnHandleError(operation) {
  return (err) => {
    assert.ok(false, err);
  };
}

describe('convert', function () {
  it('#buildOperation', function () {
    function testMixin(superClass) {
      return class TestMixin extends superClass {

        handleError(operation) {
          return failOnHandleError(operation);
        }

        read(operation) {
          const fixture = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
          return (operation) => ({
            type: 'remote',
            stream: () => Promise.resolve(fixture)
          });
        }

        buildOperation(operation) {
          operation.foo = 'bar';
          return Promise.resolve(operation);
        }
      };
    }

    const ConvertClass = testMixin(Convert(class {
    }));
    const convert = new ConvertClass();
    const operation = new FlamingoOperation();
    return convert.handle(operation).then(() => {
      assert.equal(operation.foo, 'bar');
    });
  });

  it('#validOperation rejects', function () {
    function testMixin(superClass) {
      return class TestMixin extends superClass {
        handleError(operation) {
          return failOnHandleError(operation);
        }

        validOperation(operation) {
          return operation.shouldFail ? Promise.reject() : Promise.resolve(operation);
        }
      };
    }

    const convert = new (testMixin(Convert(class {
    })));
    const operation = new FlamingoOperation();
    operation.shouldFail = true;
    return convert.handle(operation)
      .catch(() => assert.ok(true, 'validOperation triggers a convert reject'));
  });

  it('#write', function () {
    const convert = new (Convert(class {
      handleError(operation) {
        return failOnHandleError(operation);
      }
    }));
    const operation = new FlamingoOperation();

    operation.writer = sinon.spy();
    convert.write(operation);
    assert.ok(operation.writer.called);
  });

  it('#handle', function () {
    const fixture = fs.createReadStream(path.join(__dirname, '../../fixtures/images/base64.png'));
    const buildOperationSpy = sinon.stub().returns(Promise.resolve());
    const readSpy = sinon.stub().returns(() => Promise.resolve({
      stream: () => Promise.resolve(fixture),
      type: 'remote'
    }));
    const preprocessSpy = sinon.stub().returns((operation) => operation.stream());
    const validStreamSpy = sinon.stub().returns((operation) => Promise.resolve(operation));
    const processSpy = sinon.stub().returns((operation) => ((stream) => stream));
    const writeSpy = sinon.stub().returns((operation) => operation);

    const operation = new FlamingoOperation();
    const convert = new (class extends Convert(class {
    }) {
      buildOperation() {
        return buildOperationSpy(...arguments);
      }

      read() {
        return readSpy(...arguments);
      }

      preprocess() {
        return preprocessSpy(...arguments);
      }

      validStream() {
        return validStreamSpy(...arguments);
      }

      process() {
        return processSpy(...arguments);
      }

      write() {
        return writeSpy(...arguments);
      }
    });

    return convert.handle(operation).then(() => {
      assert.ok(buildOperationSpy.called);
      assert.ok(readSpy.called);
      assert.ok(preprocessSpy.called);
      assert.ok(validStreamSpy.called);
      assert.ok(processSpy.called);
      assert.ok(writeSpy.called);
    });
  });

  it('#handleError', function () {
    const errorSpy = sinon.spy();
    const operation = new FlamingoOperation();
    const writeReject = 'write-reject';

    const convert = new (class extends Convert(class {
    }) {
      handleError(operation) {
        return errorSpy;
      }

      write(operation) {
        return () => Promise.reject(writeReject);
      }
    });

    sinon.spy(convert, 'buildOperation');
    sinon.spy(convert, 'read');
    sinon.spy(convert, 'preprocess');
    sinon.spy(convert, 'validStream');
    sinon.spy(convert, 'process');

    return convert.handle(operation).finally(() =>
      assert.ok(errorSpy.called));
  });
});
