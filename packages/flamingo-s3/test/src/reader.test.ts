import assert = require("assert");
import sinon = require("sinon");
import reader = require("../../src/reader");
import Errors = require("flamingo/src/util/errors");

const { InvalidInputError } = Errors;

describe("reader", function() {
  it("passes given bucket and key to s3 sdk methods", function() {
    const BUCKET = "bucket";
    const KEY = "key";
    const S3_PARAMS = {
      Bucket: BUCKET,
      Key: KEY
    };
    const s3 = {
      headObject(params) {
        assert.deepEqual(params, S3_PARAMS);
        return {
          promise: () => Promise.resolve()
        };
      },
      getObject: function(params) {
        assert.deepEqual(params, S3_PARAMS);
      }
    };

    return reader(BUCKET, KEY, s3);
  });

  it("checks that the bucket exists before resolving the stream object", function() {
    let calledHead = false;
    const BUCKET = "bucket";
    const KEY = "key";
    const s3 = {
      headObject: function() {
        calledHead = true;
        return { promise: () => Promise.resolve() };
      },
      getObject: sinon.spy()
    };

    return reader(BUCKET, KEY, s3).then(function(data) {
      assert.ok(calledHead, "called headObject");
      assert.ok(data.stream, "has stream method");
    });
  });

  it("rejects if headObject fails", function() {
    const headError = { foo: "bar" };
    const BUCKET = "bucket";
    const KEY = "key";
    const s3 = {
      headObject: function(_) {
        return { promise: () => Promise.reject(headError) };
      }
    };

    return reader(BUCKET, KEY, s3)
      .then(function() {
        assert.ok(false, "shouldn't resolve");
      })
      .catch(function(data) {
        assert.ok(data instanceof InvalidInputError);
      });
  });

  it("resolved stream object calls s3 api createReadStream method", function() {
    const createReadStream = sinon.spy();
    const BUCKET = "bucket";
    const KEY = "key";
    const s3 = {
      headObject: function() {
        return { promise: () => Promise.resolve() };
      },
      getObject: function() {
        return { createReadStream };
      }
    };

    return reader(BUCKET, KEY, s3).then(function(data) {
      data.stream();
      assert.ok(data.stream, "has stream method");
      assert.ok(createReadStream.called, "called object.createReadStream");
    });
  });

  it('resolved reader type "s3"', function() {
    const BUCKET = "bucket";
    const KEY = "key";
    const s3 = {
      headObject: function() {
        return { promise: () => Promise.resolve() };
      },
      getObject: sinon.spy()
    };

    return reader(BUCKET, KEY, s3).then(function(data) {
      assert.strictEqual(data.type, "s3");
    });
  });
});
