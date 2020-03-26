import assert = require("assert");
import cipher = require("../../../src/util/cipher");

const { encode, decode } = cipher;

describe("cipher", function () {
  it("#encode", async function () {
    const payload = "test";
    const cipher = "BF-CBC";
    const key = Buffer.from("DjiZ7AWTeNh38zoQiZ76gw::", "base64");
    const iv = Buffer.from("_ag3WU77");

    const encoded = await encode(payload, cipher, key, iv);
    const plain = await decode(encoded, cipher, key, iv);

    assert.strictEqual(plain, payload);
  });
});
