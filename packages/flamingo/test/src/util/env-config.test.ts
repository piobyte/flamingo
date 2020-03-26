import assert = require("assert");
import envConfig = require("../../../src/util/env-config");
import envParser = require("../../../src/util/env-parser");

describe("env-parser", function () {
  it("checks that the basic overwriting works", function () {
    const conf = { EXISTING: { PATH: "wasd" }, OBJ: { EXISTING: "fdsa" } };
    const env = {
      FOO: "bar",
      OBJ_PATH: "42",
      OBJ_FOO_BAR: "true",
      OBJ_EXISTING: "asdf",
    };

    assert.deepEqual(
      envConfig(conf, env, [
        ["FOO", "FOO"],
        ["OBJ_PATH", "OBJ.PATH", envParser.int(0)],
        ["OBJ_FOO_BAR", "OBJ.FOO.BAR", envParser.boolean],
        ["OBJ_EXISTING", "OBJ.EXISTING"],
        ["EXISTING_PATH", "EXISTING.PATH"],
        ["SOME_FIELD", "SOME.FIELD"],
      ]),
      {
        FOO: "bar",
        EXISTING: { PATH: "wasd" },
        OBJ: {
          PATH: 42,
          FOO: { BAR: true },
          EXISTING: "asdf",
        },
      }
    );
  });
});
