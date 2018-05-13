import assert = require('assert');
import sinon = require('sinon');
import fs = require('fs');
import path = require('path');

import FlamingoOperation = require('../../../src/model/flamingo-operation');
import Convert = require('../../../src/mixins/convert');
import Route = require('../../../src/model/route');
import DummyRoute = require('../../test-util/DummyRoute');

function failOnHandleError(operation) {
  return err => {
    assert.ok(false, err);
  };
}

describe('convert', function() {
  it('#validOperation rejects', function() {
    function testMixin(superClass) {
      return class TestMixin extends superClass {
        handleError(request, reply, error, operation = {}) {
          return failOnHandleError(operation);
        }

        validOperation(operation) {
          return operation.shouldFail
            ? Promise.reject('should fail')
            : Promise.resolve(operation);
        }
      };
    }

    const convert = new (testMixin(Convert(Route)))();
    const operation = new FlamingoOperation();
    operation.shouldFail = true;
    return convert
      .handle(operation)
      .catch(() => assert.ok(true, 'validOperation triggers a convert reject'));
  });

  it('#write', function() {
    const convert = new class extends Convert(DummyRoute) {
      handleError(request, reply, error, operation = {}) {
        return failOnHandleError(operation);
      }
    }();
    const operation = new FlamingoOperation();

    operation.writer = sinon.spy();
    convert.write(operation);
    assert.ok((operation.writer as any).called);
  });

  it('#handle', async function() {
    const fixture = fs.createReadStream(
      path.join(__dirname, '../../fixtures/images/base64.png')
    );
    const readSpy = sinon.stub().returns(() =>
      Promise.resolve({
        stream: () => Promise.resolve(fixture),
        type: 'remote'
      })
    );
    const preprocessSpy = sinon.stub().returns(operation => operation.stream());
    const validStreamSpy = sinon
      .stub()
      .returns(operation => Promise.resolve(operation));
    const processSpy = sinon.stub().returns(operation => stream => stream);
    const writeSpy = sinon.stub().returns(operation => operation);

    const operation = new FlamingoOperation();
    const convert = new class extends Convert(class extends DummyRoute {}) {
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
    }();

    await convert.handle(operation);
    assert.ok(readSpy.called);
    assert.ok(preprocessSpy.called);
    assert.ok(validStreamSpy.called);
    assert.ok(processSpy.called);
    assert.ok(writeSpy.called);
  });
});
