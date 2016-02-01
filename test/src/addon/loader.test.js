const assert = require('assert');
const isPlainObject = require('lodash/isPlainObject');
const path = require('path');
const Loader = require('../../../src/addon/loader');

function loader() {
  return new Loader(path.join(__dirname, '../../fixtures'), {}).load();
}

describe('loader', function () {

  it('returns undefined for package without main field or index.js', function () {
    var testAddon = {
      path: path.join(__dirname, '../../fixtures/test-addon'),
      pkg: {}
    };

    assert.equal(loader().resolvePkg(testAddon), undefined);
  });

  it('loads the file that is defined in the main field', function () {
    var testAddon = {
      path: path.join(__dirname, '../../fixtures/test-addon'),
      pkg: {main: 'not-index.js'}
    };

    assert.ok(loader().resolvePkg(testAddon));
  });

  it('loads the file that is defined in the main field', function () {
    const testAddon = {
      path: path.join(__dirname, '../../fixtures/test-addon'),
      pkg: {main: 'not-index.js'}
    };
    const resolved = loader().resolvePkg(testAddon);

    assert.ok(resolved);
    assert.ok(isPlainObject(resolved.hooks));
  });

  it('should do nothing for invalid package paths', function () {
    loader().fromPackage(path.join(__dirname, '../../fixtures'));
  });

  it('should load the addon package.json', function () {
    var addon = loader().fromPackage(path.join(__dirname, '../../fixtures/node_modules/test-addon-0/'));

    assert.equal(addon.pkg.name, 'test-addon-0');
  });

  it('should ignore non flamingo addons', function () {
    var addon = loader().fromPackage(path.join(__dirname, '../../fixtures/node_modules/other-module/'));

    assert.deepEqual(addon, undefined);
  });
});
