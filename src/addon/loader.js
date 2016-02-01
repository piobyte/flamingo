const path = require('path');
const fs = require('fs');
const assign = require('lodash/assign');
const noop = require('lodash/noop');
const forOwn = require('lodash/forOwn');
const reduce = require('lodash/reduce');
const assert = require('assert');
const logger = require('../logger').build('addon-loader');

class AddonLoader {
  constructor(rootPath, pkg, modulesDir = 'node_modules', callbacks = require('./callbacks')) {
    this.ADDON_KEYWORD = 'flamingo-addon';

    this._hooks = {};
    this._callbacks = {};
    this._loaded = false;

    this.callbacks = callbacks;
    this.rootPath = rootPath;
    this.package = pkg;
    this.modulesDir = modulesDir;
    this.addons = [];
  }

  load() {
    const addons = this.discover(this.rootPath, this.package, this.modulesDir);

    /* istanbul ignore next */
    if (addons.length) {
      this.addons = addons;
      logger.info('using addons: ' +
        addons.map(addon => `${addon.pkg.name}@${addon.pkg.version}`).join(', '));
    }

    this.finalize(this.reduceAddonsToHooks(addons, this._hooks));

    return this;
  }

  unload() {
    this._loaded = false;
    this._hooks = {};

    return this;
  }

  discover(rootPath, pkg, modulesDir = 'node_modules') {
    const deps = assign({}, pkg.dependencies, pkg.devDependencies);

    return Object.keys(deps)
      .map(dependency => this.fromPackage(path.join(rootPath, modulesDir, dependency, '/')))
      .filter(Boolean)
      .map(this.resolvePkg)
      .filter(Boolean);
  }

  resolvePkg(addon/*: Addon */)/*: ?Addon */ {
    const main = addon.pkg.main || 'index.js';
    const mainPath = path.join(addon.path, main);
    let loadedAddon;

    /*eslint no-sync: 0*/
    if (fs.existsSync(mainPath)) {
      addon.hooks = require(mainPath);
      loadedAddon = addon;
    } else {
      logger.warn('can\'t find entrypoint for addon: ' + addon.pkg.name);
    }
    return loadedAddon;
  }

  fromPackage(packagePath) {
    // load packagejson if exists
    const pkg = path.join(packagePath, 'package.json');
    if (fs.existsSync(pkg)) {
      const packageJson = require(pkg);
      const keywords = packageJson.keywords || [];

      if (keywords.indexOf(this.ADDON_KEYWORD) > -1) {
        return {
          path: packagePath,
          pkg: packageJson
        };
      }
    } else {
      logger.debug('no package.json found at ' + packagePath);
    }
  }

  reduceAddonsToHooks(addons/* [hooks: {}] */, loaderHooks/*: {[key: string]: []} */)/*: {} */ {
    // map addons to object where key equals the addons hooks name
    return reduce(addons, function (hooks, addon) {
      forOwn(addon.hooks, function (val, key) {
        // provide empty array for hook key
        hooks[key] = hooks[key] || [];

        hooks[key].push({
          hook: addon.hooks[key],
          addon: addon
        });
      });
      return hooks;
    }, loaderHooks);
  }

  callback(hookName/*: string */, callback/*: function */) {
    this._callbacks[hookName] = callback;
  }

  finalize(hooks/*: {} */) {
    this._hooks = hooks;
    this.callbacks(this);
    this._loaded = true;
  }


  /**
   * Creates a function that can be called with additional params that calls all addons for a given hook.
   * The second param is passed to each addon hook.
   * The returned function represents a call to the callback for the hookName.
   * @param {string} hookName name of the hook
   * @param {object} [hookConfig] config object that is provided to each hook
   * @return {function} generated hook function
   * @example
   * results = hook('IMG_PIPE')(pipe);
   */
  hook(hookName/*: string */, hookConfig/*: any */)/*: function */ {
    assert(this._loaded, 'addons have to be loaded before calling any hooks');
    assert(this._callbacks[hookName], 'no registered callback for ' + hookName);

    var hookFunction = noop;

    if (this._hooks[hookName]) {
      hookFunction = (...args) => {
        const callbackFn = this._callbacks[hookName](...args);
        return this._hooks[hookName]
          .map(hook => callbackFn(hook.hook(hookConfig)));
      };
    }

    return hookFunction;
  }
}

module.exports = AddonLoader;
