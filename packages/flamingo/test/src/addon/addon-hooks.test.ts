import assert = require("assert");
import sinon = require("sinon");
import path = require("path");
import Addon = require("../../../src/addon");
import Loader = require("../../../src/addon/loader");
import FlamingoOperation = require("../../../src/model/flamingo-operation");

const {
  HOOKS: {
    CONF,
    ENV,
    ROUTES,
    HAPI_PLUGINS,
    PROFILES,
    LOG_STREAM,
    EXTRACT_PROCESS,
    START,
    STOP,
  },
} = Addon;

function loader() {
  return new Loader(path.join(__dirname, "../../fixtures"), {
    dependencies: {
      "test-addon-0": "^0.1.0",
      "test-addon-1": "^0.1.0",
      "add-auth-header": "^0.1.0",
      "force-webp": "^0.1.0",
    },
  }).load();
}

describe("hook", function () {
  it("should throw an error if an unregistered hook is called", function () {
    assert.throws(function () {
      loader().hook("LOREM_IPSUM");
    });
  });
  it("should do nothing if an registered hook is called without addons using it", function () {
    const spy = sinon.spy();
    const l = loader();

    l.callback("WASD", spy);
    l.hook("WASD");

    assert.ok(!spy.called);
  });

  describe("CONF", function () {
    it("should merge all addon configs into the initial config", function () {
      const conf = { FOO: "bar" };

      loader().hook(CONF)(conf);

      assert.deepEqual(conf, {
        FOO: "bar",
        TEST_CONF: { ENABLED: true },
      });
    });
    it("shouldn't overwrite initial config fields", function () {
      const conf = { TEST_CONF: { ENABLED: false } };

      loader().hook(CONF)(conf);

      assert.deepEqual(conf, { TEST_CONF: { ENABLED: false } });
    });
    it("keeps buffer objects intact (https://github.com/lodash/lodash/issues/1453)", function () {
      const conf = { FOO: { Bar: Buffer.from("uname -a", "utf8") } };
      const EXPECTED = Buffer.from("uname -a", "utf8");

      loader().hook(CONF)(conf);

      assert.ok(conf.FOO.Bar instanceof Buffer);
      assert.strictEqual(conf.FOO.Bar.toString(), EXPECTED.toString());
    });
  });

  describe("ENV", function () {
    it("should handle environment variables", function () {
      const conf = {};
      const env = { TEST_CONF_ENABLED: "false" };

      loader().hook(ENV)(conf, env);

      assert.deepEqual(conf, { TEST: { CONF: { ENABLED: false } } });
    });
  });

  describe("ROUTES", function () {
    it("should call the server.route method", function () {
      const server = { route: sinon.spy() };

      loader().hook(ROUTES)(server);

      assert.ok(server.route.calledOn(server));
      assert.ok(server.route.called);
    });
  });

  describe("HAPI_PLUGINS", function () {
    it("should push plugins in the given plugins array", function () {
      const plugins = [];

      loader().hook(HAPI_PLUGINS)(plugins);

      assert.ok(plugins.length === 1);
    });
  });

  describe("PROFILES", function () {
    it("should merge addon profiles in existing profile object", function () {
      const profiles = {
        addonProfile: true,
      };

      loader().hook(PROFILES)(profiles);

      assert.deepEqual(Object.keys(profiles), ["addonProfile", "foo-bar"]);
    });
  });

  describe("LOG_STREAM", function () {
    it("call the addStreams method of the logger", function () {
      const logger = { addStreams: sinon.spy() };

      loader().hook(LOG_STREAM)(logger);

      assert.ok(logger.addStreams.called);
    });
  });

  describe("EXTRACT_PROCESS", function () {
    it("allows to modify the extracted process", function () {
      let calledToFormatWebp = false;
      const extracted: any = {
        response: { header: {} },
        process: [
          {
            processor: "sharp",
            pipe: (pipe) => pipe.rotate(),
          },
        ],
      };

      const operation = new FlamingoOperation();
      loader().hook(EXTRACT_PROCESS)(extracted, operation);
      assert.equal(extracted.response.header.Authorization, "Basic 1234");
      extracted.process[0].pipe({
        rotate() {
          return this;
        },
        toFormat(format) {
          if (format === "webp") {
            calledToFormatWebp = true;
          }
          return this;
        },
      });

      assert.ok(calledToFormatWebp);
    });
  });

  describe("START", function () {
    it("calls hook function", function () {
      const server = { foo: 1 };

      loader().hook(START, server)();
      assert.equal(server.foo, 2);
    });
  });
  describe("STOP", function () {
    it("calls hook function", function () {
      const server = { foo: 2 };

      loader().hook(STOP, server)();
      assert.equal(server.foo, 3);
    });
  });
});
