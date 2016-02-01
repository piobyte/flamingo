const assert = require('assert');
const ProfileOperation = require('../../../src/mixins/profile-operation');
const FlamingoOperation = require('../../../src/model/flamingo-operation');
const Config = require('../../../config');
const Promise = require('bluebird');
const sinon = require('sinon');
const errors = require('../../../src/util/errors');
const httpReader = require('../../../src/reader/https');
const responseWriter = require('../../../src/writer/response');
const url = require('url');

describe('profile-operation', function () {
  it('extracts the input url by decoding the url param', function () {
    const ProfileOperationClass = ProfileOperation(class {
    });
    const conf = new Config();
    const profile = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const url = 'http://example.com/image.png';
    const encodedUrl = encodeURIComponent(url);

    conf.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);
    operation.config = conf;
    operation.request = {params: {url: encodedUrl}};

    return profile.inputUrl(operation).then(inputUrl => {
      assert.equal(inputUrl, url);
    });
  });

  it('extracts the operations profile based on the profile param', function () {
    const ProfileOperationClass = ProfileOperation(class {
    });
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profile = 'someProfile';
    const profileSpy = sinon.spy();

    operation.request = {params: {profile}};
    operation.config = conf;
    operation.profiles = {
      someProfile: (request, config) => {
        assert.deepEqual(request, operation.request);
        assert.deepEqual(config, operation.config);
        return Promise.resolve(profileSpy);
      }
    };

    return profileOp.extractProfile(operation).then(extractedProfile => {
      assert.equal(extractedProfile, profileSpy);
    });
  });

  it('rejects extraction for unknown profiles', function () {
    const ProfileOperationClass = ProfileOperation(class {
    });
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profileSpy = sinon.spy();

    operation.profiles = {someProfile: () => Promise.resolve(profileSpy)};
    operation.config = conf;
    operation.request = {params: {profile: 'someUnknownProfile'}};

    return profileOp.extractProfile(operation).catch(e => {
      assert.ok(e instanceof errors.InvalidInputError);
    });
  });

  it('builds an operation', function () {
    const ProfileOperationClass = ProfileOperation(class {
    });
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profile = 'someProfile';
    const givenUrl = 'http://example.com/image.png';
    const encodedUrl = encodeURIComponent(givenUrl);
    const profileSpy = sinon.spy();
    conf.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);

    operation.request = {params: {profile, url: encodedUrl}};
    operation.config = conf;
    operation.profiles = {
      someProfile: (request, config) => Promise.resolve(profileSpy)
    };

    return profileOp.buildOperation(operation).then((operation) => {
      assert.equal(operation.profile, profileSpy);
      assert.equal(operation.reader, httpReader);
      assert.deepEqual(operation.targetUrl, url.parse(givenUrl));
      assert.equal(operation.writer, responseWriter);
    });
  });

  it('rejects for unknown readers', function () {
    const ProfileOperationClass = ProfileOperation(class {
    });
    const conf = new Config();
    const profileOp = new ProfileOperationClass();
    const operation = new FlamingoOperation();
    const profile = 'someProfile';
    const givenUrl = 'ftp://example.com/image.png';
    const encodedUrl = encodeURIComponent(givenUrl);
    const profileSpy = sinon.spy();
    conf.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);

    operation.request = {params: {profile, url: encodedUrl}};
    operation.config = conf;
    operation.profiles = {
      someProfile: (request, config) => Promise.resolve(profileSpy)
    };

    return profileOp.buildOperation(operation)
      .catch(e => assert.ok(e instanceof errors.InvalidInputError));
  });
});
