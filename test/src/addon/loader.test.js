const assert = require('assert');
const isPlainObject = require('lodash/isPlainObject');
const path = require('path');
const Loader = require('../../../src/addon/loader');

function loader() {
  return new Loader(path.join(__dirname, '../../fixtures'), {}).load();
}

describe('loader', function () {

  it('returns undefined for package without main field or index.js', function () {
    const testAddon = {
      path: path.join(__dirname, '../../fixtures/test-addon'),
      pkg: {}
    };

    assert.equal(loader().resolvePkg(testAddon), undefined);
  });

  it('loads the file that is defined in the main field', function () {
    const testAddon = {
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
    const addon = loader().fromPackage(path.join(__dirname, '../../fixtures/node_modules/test-addon-0/'));

    assert.equal(addon.pkg.name, 'test-addon-0');
  });

  it('should ignore non flamingo addons', function () {
    const addon = loader().fromPackage(path.join(__dirname, '../../fixtures/node_modules/other-module/'));

    assert.deepEqual(addon, undefined);
  });

  it('#reduceAddonsToHooks', function () {
    const FOO_HOOK = 'FOO_HOOK';
    const BAR_HOOK = 'BAR_HOOK';
    const BAZ_HOOK = 'BAZ_HOOK';
    const TEST_HOOK = 'TEST_HOOK';

    const FOOBAR = {hooks: {FOO_HOOK, BAR_HOOK}, path: '/tmp/foobar'};
    const BARBAZ = {hooks: {BAR_HOOK, BAZ_HOOK}, path: '/tmp/barbaz'};
    const TEST = {hooks: {TEST_HOOK}, path: '/tmp/test'};

    const reduced = loader().reduceAddonsToHooks(
      [
        FOOBAR,
        BARBAZ,
        TEST,
      ],
      {});

    assert.ok(reduced.FOO_HOOK.find(data => data.hook === FOO_HOOK && data.addon.path === FOOBAR.path));
    assert.ok(reduced.BAR_HOOK.find(data => data.hook === BAR_HOOK && data.addon.path === FOOBAR.path));
    assert.ok(reduced.BAR_HOOK.find(data => data.hook === BAR_HOOK && data.addon.path === BARBAZ.path));
    assert.ok(reduced.BAZ_HOOK.find(data => data.hook === BAZ_HOOK && data.addon.path === BARBAZ.path));
    assert.ok(reduced.TEST_HOOK.find(data => data.hook === TEST_HOOK && data.addon.path === TEST.path));
  });

  it('reduceAddonsToHooks with already initialized hooks object', function () {
    const FOO_HOOK = 'FOO_HOOK';
    const BAR_HOOK = 'BAR_HOOK';
    const BAZ_HOOK = 'BAZ_HOOK';
    const TEST_HOOK = 'TEST_HOOK';
    const YET_ANOTHER_HOOK = 'YET_ANOTHER_HOOK';

    const FOOBAR = {hooks: {FOO_HOOK, BAR_HOOK}, path: '/tmp/foobar'};
    const BARBAZ = {hooks: {BAR_HOOK, BAZ_HOOK}, path: '/tmp/barbaz'};
    const TEST = {hooks: {TEST_HOOK}, path: '/tmp/test'};

    const reduced = loader().reduceAddonsToHooks(
      [
        FOOBAR,
        BARBAZ,
        TEST,
      ],
      {
        [YET_ANOTHER_HOOK]: [{
          hook: YET_ANOTHER_HOOK,
          addon: {path: '/tmp/yah'}
        }]
      });

    assert.ok(reduced.FOO_HOOK.find(data => data.hook === FOO_HOOK && data.addon.path === FOOBAR.path));
    assert.ok(reduced.BAR_HOOK.find(data => data.hook === BAR_HOOK && data.addon.path === FOOBAR.path));
    assert.ok(reduced.BAR_HOOK.find(data => data.hook === BAR_HOOK && data.addon.path === BARBAZ.path));
    assert.ok(reduced.BAZ_HOOK.find(data => data.hook === BAZ_HOOK && data.addon.path === BARBAZ.path));
    assert.ok(reduced.TEST_HOOK.find(data => data.hook === TEST_HOOK && data.addon.path === TEST.path));
    assert.ok(reduced.YET_ANOTHER_HOOK.find(data => data.hook === YET_ANOTHER_HOOK && data.addon.path === '/tmp/yah'));
  });
});
