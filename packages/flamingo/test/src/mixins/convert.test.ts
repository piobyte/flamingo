/* eslint-disable prefer-rest-params */
import assert = require("assert");
import sinon = require("sinon");
import fs = require("fs");
import path = require("path");
import Hapi = require("@hapi/hapi");
import nodeStream = require("stream");

import FlamingoOperation = require("../../../src/model/flamingo-operation");
import Convert = require("../../../src/mixins/convert");
import Route = require("../../../src/model/route");
import DummyRoute = require("../../test-util/DummyRoute");

function failOnHandleError() {
  return (err: Error) => {
    assert.ok(false, err);
  };
}

describe("convert", function () {
  it("#validOperation rejects", function () {
    function testMixin(superClass: any) {
      return class TestMixin extends superClass {
        handleError() {
          return failOnHandleError();
        }

        validOperation(operation: any) {
          return operation.shouldFail
            ? Promise.reject("should fail")
            : Promise.resolve(operation);
        }
      };
    }

    const convert = new (testMixin(Convert(Route)))();
    const operation = new FlamingoOperation();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    operation.shouldFail = true;
    return convert
      .handle(operation)
      .catch(() => assert.ok(true, "validOperation triggers a convert reject"));
  });

  it("#write", function () {
    const convert = new (class extends Convert(DummyRoute) {
      handleError() {
        return failOnHandleError() as any as Hapi.ResponseObject;
      }
    })();
    const operation = new FlamingoOperation();

    operation.writer = sinon.spy();
    convert.write(operation);
    assert.ok((operation.writer as any).called);
  });

  it("#handle", async function () {
    const fixture = fs.createReadStream(
      path.join(__dirname, "../../fixtures/images/base64.png")
    );
    const readSpy = sinon.stub().returns(() =>
      Promise.resolve({
        stream: () => Promise.resolve(fixture),
        type: "remote",
      })
    );
    const preprocessSpy = sinon
      .stub()
      .returns((operation: any) => operation.stream());
    const validStreamSpy = sinon
      .stub()
      .returns((operation: FlamingoOperation) => Promise.resolve(operation));
    const processSpy = sinon
      .stub()
      .returns(
        (operation: FlamingoOperation) => (stream: nodeStream.Readable) =>
          stream
      );
    const writeSpy = sinon
      .stub()
      .returns((operation: FlamingoOperation) => operation);

    const operation = new FlamingoOperation();
    const convert = new (class extends Convert(class extends DummyRoute {}) {
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
    })();

    await convert.handle(operation);
    assert.ok(readSpy.called);
    assert.ok(preprocessSpy.called);
    assert.ok(validStreamSpy.called);
    assert.ok(processSpy.called);
    assert.ok(writeSpy.called);
  });
});
