import assert = require("assert");
import sinon = require("sinon");
import url = require("url");
import Hapi = require("@hapi/hapi");

import ProfileOperation = require("../../../src/mixins/profile-operation");
import Route = require("../../../src/model/route");
import cipher = require("../../../src/util/cipher");
import errors = require("../../../src/util/errors");
import Convert = require("../../../src/mixins/convert");
import FlamingoOperation = require("../../../src/model/flamingo-operation");
import Config = require("../../../config");
import httpReader = require("../../../src/reader/https");
import responseWriter = require("../../../src/writer/response");
import Server = require("../../../src/model/server");
import NoopAddonLoader = require("../../test-util/NoopAddonLoader");

const { InvalidInputError } = errors;
const { encode } = cipher;

class ProfilesServer extends Server {
  constructor(profiles: any) {
    super({}, new NoopAddonLoader());
    this.profiles = profiles;
  }
}

describe("profile-operation", function () {
  it("extracts the input url by decoding the url param", async function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const profile = new ProfileOperationClass({}, "get", "/");
    const operation = new FlamingoOperation();
    const testUrl = "http://example.com/image.png";

    const config = await Config.fromEnv();
    const cipherUrl = await encode(
      testUrl,
      config.CRYPTO!.CIPHER,
      config.CRYPTO!.KEY,
      config.CRYPTO!.IV
    );
    operation.config = config;
    operation.request = { params: { url: cipherUrl } };

    const input = await profile.extractInput(operation);
    assert.deepStrictEqual(input, url.parse(testUrl));
  });

  it("extracts the operations profile based on the profile param", async function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const conf = new Config();
    const profileOp = new ProfileOperationClass({}, "get", "/");
    const operation = new FlamingoOperation();
    const profile = "someProfile";
    const profileSpy = sinon.spy();

    operation.request = { params: { profile } };
    operation.config = conf;
    const profiles = {
      someProfile: (request: Hapi.Request, config: Config) => {
        assert.deepStrictEqual(request, operation.request);
        assert.deepStrictEqual(config, operation.config);
        return Promise.resolve(profileSpy);
      },
    };
    profileOp.server = new ProfilesServer(profiles);

    const extractedProfile = await profileOp.extractProcess(operation);
    assert.strictEqual(extractedProfile, profileSpy);
  });

  it("rejects extraction for unknown profiles", function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const conf = new Config();
    const profileOp = new ProfileOperationClass({}, "get", "/");
    const operation = new FlamingoOperation();
    const profileSpy = sinon.spy();

    const profiles = { someProfile: () => Promise.resolve(profileSpy) };
    profileOp.server = new ProfilesServer(profiles);
    operation.config = conf;
    operation.request = { params: { profile: "someUnknownProfile" } };

    return profileOp
      .extractProcess(operation)
      .catch((e) => assert.ok(e instanceof InvalidInputError));
  });

  it("builds an operation", async function () {
    const config = await Config.fromEnv();
    const profile = "someProfile";
    const givenUrl = "http://example.com/image.png";
    const profileData = {
      process: [{ processor: "foo", pipe: (p: any) => p }],
      response: { header: { foo: "bar" } },
    };

    const encoded = await encode(
      givenUrl,
      config.CRYPTO!.CIPHER,
      config.CRYPTO!.KEY,
      config.CRYPTO!.IV
    );
    const request = {
      params: { profile, url: encoded },
    } as unknown as Hapi.Request;
    const reply = sinon.spy() as unknown as Hapi.ResponseToolkit;

    const ProfileOperationClass = ProfileOperation(
      class extends Convert(Route) {
        buildOperation(request: Hapi.Request, reply: Hapi.ResponseToolkit) {
          return super.buildOperation(request, reply).then((operation) => {
            operation.process = profileData.process;
            operation.response = profileData.response;
            operation.config = config;
            operation.request = request;
            return Promise.resolve(operation);
          });
        }
      }
    );
    const profiles = { someProfile: () => Promise.resolve(profileData) };
    const profileOp = new ProfileOperationClass(config, "get", "/");
    profileOp.server = new ProfilesServer(profiles);

    const operation = await profileOp.buildOperation(request, reply);

    assert.deepStrictEqual(operation.process, profileData.process);
    assert.deepStrictEqual(operation.response, profileData.response);
    assert.strictEqual(operation.reader, httpReader);
    assert.deepStrictEqual(operation.input, url.parse(givenUrl));
    assert.strictEqual(operation.writer, responseWriter);
  });

  it("rejects for unknown readers", function () {
    const conf = new Config();
    const operation = new FlamingoOperation();
    const profile = "someProfile";
    const givenUrl = "ftp://example.com/image.png";
    const encodedUrl = encodeURIComponent(givenUrl);
    const request = {
      params: { profile, url: encodedUrl },
    } as unknown as Hapi.Request;
    const reply = sinon.spy() as unknown as Hapi.ResponseToolkit;

    operation.request = { params: { profile, url: encodedUrl } };
    operation.config = conf;
    // conf.profiles = {
    //   someProfile: (request, config) => Promise.resolve(profileSpy)
    // };

    const ProfileOperationClass = ProfileOperation(
      class extends Route {
        extractInput(operation: FlamingoOperation) {
          return Promise.resolve(
            decodeURIComponent(operation.request.params.url)
          );
        }

        buildOperation(request: Hapi.Request, reply: Hapi.ResponseToolkit) {
          return Promise.resolve(operation);
        }
      }
    );
    const profileOp = new ProfileOperationClass({}, "get", "/");

    return profileOp
      .buildOperation(request, reply)
      .catch((e) => assert.ok(e instanceof InvalidInputError));
  });
});
