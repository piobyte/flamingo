var assert = require('assert'),
    isPlainObject = require('lodash/lang/isPlainObject'),
    path = require('path');

describe('addon-loader', function () {
    var discovery = require('../../../src/addon/discovery');

    it('returns undefined for package without main field or index.js', function () {
        var testAddon = {
            path: path.join(__dirname, '../../fixtures/test-addon'),
            pkg: {}
        };

        assert.equal(discovery.resolvePkg(testAddon), undefined);
    });

    it('loads the file that is defined in the main field', function () {
        var testAddon = {
            path: path.join(__dirname, '../../fixtures/test-addon'),
            pkg: {main: 'not-index.js'}
        };

        assert.ok(discovery.resolvePkg(testAddon));
    });

    it('loads the file that is defined in the main field', function () {
        var testAddon = {
                path: path.join(__dirname, '../../fixtures/test-addon'),
                pkg: {main: 'not-index.js'}
            },
            resolved = discovery.resolvePkg(testAddon);

        assert.ok(resolved);
        assert.ok(isPlainObject(resolved.hooks));
    });

    it('should do nothing if invalid package path', function () {
        discovery.fromPackage('../../fixtures');
    });

    it('should load the addon package.json', function () {
        var addon = discovery.fromPackage(
            path.join(__dirname, '../../fixtures/node_modules/test-addon-0/'));

        assert.equal(addon.pkg.name, 'test-addon');
    });

    it('should ignore non flamingo addons', function () {
        var addon = discovery.fromPackage(
            path.join(__dirname, '../../fixtures/node_modules/other-module/'));

        assert.deepEqual(addon, undefined);
    });
});
