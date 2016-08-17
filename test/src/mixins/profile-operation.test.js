const assert = require('assert');
const ProfileOperation = require('../../../src/mixins/profile-operation');
const Convert = require('../../../src/mixins/convert');
const Route = require('../../../src/model/route');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const Config = require('../../../config');
const Promise = require('bluebird');
const sinon = require('sinon');
const {InvalidInputError} = require('../../../src/util/errors');
const httpReader = require('../../../src/reader/https');
const responseWriter = require('../../../src/writer/response');
const url = require('url');
const {encode} = require('../../../src/util/cipher');

describe('profile-operation', function () {
  it('extracts the input url by decoding the url param', function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const profile = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const testUrl = 'http://example.com/image.png';

    return Config.fromEnv().then(config =>
      encode(testUrl, config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV)
        .then(cipherUrl => {
          operation.config = config;
          operation.request = {params: {url: cipherUrl}};
          return profile.extractInput(operation);
        }).then((input) => {
          assert.deepEqual(input, url.parse(testUrl));
        }));
  });

  it('extracts the operations profile based on the profile param', function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profile = 'someProfile';
    const profileSpy = sinon.spy();

    operation.request = {params: {profile}};
    operation.config = conf;
    const profiles = {
      someProfile: (request, config) => {
        assert.deepEqual(request, operation.request);
        assert.deepEqual(config, operation.config);
        return Promise.resolve(profileSpy);
      }
    };
    profileOp.server = {profiles};

    return profileOp.extractProcess(operation).then(extractedProfile =>
      assert.equal(extractedProfile, profileSpy));
  });

  it('rejects extraction for unknown profiles', function () {
    const ProfileOperationClass = ProfileOperation(Route);
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profileSpy = sinon.spy();

    const profiles = {someProfile: () => Promise.resolve(profileSpy)};
    profileOp.server = {profiles};
    operation.config = conf;
    operation.request = {params: {profile: 'someUnknownProfile'}};

    return profileOp.extractProcess(operation)
      .catch(e => assert.ok(e instanceof InvalidInputError));
  });

  it('builds an operation', function () {
    return Config.fromEnv().then(config => {
      const profile = 'someProfile';
      const givenUrl = 'http://example.com/image.png';
      const profileData = {process: [{processor: 'foo'}], response: {header: {foo: 'bar'}}};

      return encode(givenUrl, config.CRYPTO.CIPHER, config.CRYPTO.KEY, config.CRYPTO.IV).then((encoded) => {
        const request = {params: {profile, url: encoded}};
        const reply = sinon.spy();

        const ProfileOperationClass = ProfileOperation(class extends Convert(Route) {
          buildOperation(request, reply) {
            return super.buildOperation(request, reply).then(operation => {
              operation.process = profileData.process;
              operation.response = profileData.response;
              operation.config = config;
              operation.request = request;
              return Promise.resolve(operation);
            });
          }
        });
        const profiles = {someProfile: () => Promise.resolve(profileData)};
        const profileOp = (new ProfileOperationClass(config));
        profileOp.server = {profiles, addonsLoader: {hook: () => () => {}}};

        return profileOp.buildOperation(request, reply).then((operation) => {
          assert.deepEqual(operation.process, profileData.process);
          assert.deepEqual(operation.response, profileData.response);
          assert.equal(operation.reader, httpReader);
          assert.deepEqual(operation.input, url.parse(givenUrl));
          assert.equal(operation.writer, responseWriter);
        });
      });
    });
  });

  it('rejects for unknown readers', function () {
    const conf = new Config();
    const operation = new FlamingoOperation();
    const profile = 'someProfile';
    const givenUrl = 'ftp://example.com/image.png';
    const encodedUrl = encodeURIComponent(givenUrl);
    const profileSpy = sinon.spy();
    const request = {params: {profile, url: encodedUrl}};
    const reply = sinon.spy();

    operation.request = {params: {profile, url: encodedUrl}};
    operation.config = conf;
    conf.profiles = {
      someProfile: (request, config) => Promise.resolve(profileSpy)
    };

    const ProfileOperationClass = ProfileOperation(class extends Route {
      extractInput(operation) {
        return Promise.resolve(decodeURIComponent(operation.request.params.url));
      }

      buildOperation(request, reply) {
        return Promise.resolve(operation);
      }
    });
    const profileOp = new ProfileOperationClass();

    return profileOp.buildOperation(request, reply)
      .catch(e => assert.ok(e instanceof InvalidInputError));
  });
});
