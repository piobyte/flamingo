import path = require("path");
import fs = require("fs");
import assign = require("lodash/assign");
import assert = require("assert");

import forOwn = require("lodash/forOwn");
import reduce = require("lodash/reduce");

import Logger = require("../logger");
import defaultCallbacks = require("./callbacks");
import { Addon, PackageJSON } from "../types/Addon";

const { build } = Logger;
const addonLoaderLogger = build("addon-loader");

/**
 * Addon loader
 * @class
 */
class AddonLoader {
  ADDON_KEYWORD = "flamingo-addon";
  _hooks = {};
  private _callbacks = {};
  private _loaded = false;

  callbacks;
  rootPath: string;
  package: PackageJSON;
  modulesDir: string = "node_modules";
  addons: Array<any> = [];

  /**
   *
   * @param {string} rootPath location to start looking for addons
   * @param {object} pkg package.json object
   * @param {string} [modulesDir=node_modules] modules directory
   * @param {function} [callbacks] function to later register callbacks on the loader
   */
  constructor(
    rootPath,
    pkg,
    modulesDir = "node_modules",
    callbacks = defaultCallbacks
  ) {
    this.callbacks = callbacks;
    this.rootPath = rootPath;
    this.package = pkg;
    this.modulesDir = modulesDir;
  }

  load() {
    const addons = this.discover(this.rootPath, this.package, this.modulesDir);

    /* istanbul ignore next */
    if (addons.length) {
      this.addons = addons;
      addonLoaderLogger.info(
        "using addons: " +
          addons
            .map((addon) => `${addon.pkg.name}@${addon.pkg.version}`)
            .join(", ")
      );
    }

    this.finalize(this.reduceAddonsToHooks(addons, this._hooks));

    return this;
  }

  unload() {
    this._loaded = false;
    this._hooks = {};

    return this;
  }

  /**
   * Lookup package devDependencies and dependencies and resolve all of them which contain the addon keyword
   * @param {string} rootPath
   * @param {object} pkg
   * @param {string} [modulesDir=node_modules]
   * @return {Array.<{pkg, path, hooks}>} package metadata
   */
  discover(
    rootPath: string,
    pkg: PackageJSON,
    modulesDir: string = "node_modules"
  ): Array<Addon> {
    const deps = assign({}, pkg.dependencies, pkg.devDependencies);

    return Object.keys(deps)
      .map((dependency) =>
        this.fromPackage(path.join(rootPath, modulesDir, dependency, "/"))
      )
      .filter(Boolean)
      .map(this.resolvePkg)
      .filter(Boolean);
  }

  /**
   * Generates metadata for package
   * @param {{path: string, pkg: object}} addon addon path and package.json object
   * @return {{pkg, path, hooks}} loaded addon. If no entrypoint was found, the package is skipped and a warning logged.
   */
  resolvePkg(addon: Addon): Addon {
    let loadedAddon;

    const main = addon.pkg.main || "index.js";
    const mainPath = path.join(addon.path!, main);

    /*eslint no-sync: 0*/
    if (fs.existsSync(mainPath)) {
      addon.hooks = require(mainPath);
      loadedAddon = addon;
    } else {
      addonLoaderLogger.warn(
        "can't find entrypoint for addon: " + addon.pkg.name
      );
    }

    return loadedAddon;
  }

  fromPackage(packagePath: string): Addon | undefined {
    // load packagejson if exists
    const pkg = path.join(packagePath, "package.json");
    if (fs.existsSync(pkg)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageJson = require(pkg);
      const keywords = packageJson.keywords || [];

      if (keywords.indexOf(this.ADDON_KEYWORD) > -1) {
        return {
          path: packagePath,
          pkg: packageJson,
          hooks: {},
        };
      }
    } else {
      addonLoaderLogger.debug("no package.json found at " + packagePath);
    }
  }

  /**
   * Take an array of resolvePkg results and already loaded hooks.
   * It creates a key -> Array.<{hook: string, addon}> map where each key is the hooks identifier.
   * @param addons
   * @param loaderHooks
   * @return {*}
   */
  reduceAddonsToHooks(addons: Array<Addon>, loaderHooks) {
    // map addons to object where key equals the addons hooks name
    return reduce(
      addons,
      function (hooks, addon) {
        forOwn(addon.hooks, function (val, key) {
          if (addon.hooks && addon.hooks.hasOwnProperty(key)) {
            // provide empty array for hook key
            hooks[key] = hooks[key] || [];

            hooks[key].push({
              hook: addon.hooks[key],
              addon,
            });
          }
        });
        return hooks;
      },
      loaderHooks
    );
  }

  callback(hookName: string, callback: (...any) => any) {
    this._callbacks[hookName] = callback;
  }

  finalize(hooks /*: {} */) {
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
  hook(hookName: string, hookConfig?: any): (...any) => any {
    assert(this._loaded, "addons have to be loaded before calling any hooks");
    assert(this._callbacks[hookName], "no registered callback for " + hookName);

    let hookFunction: (any) => Array<any> = () => [];

    if (this._hooks[hookName]) {
      hookFunction = (...args) => {
        const callbackFn = this._callbacks[hookName](...args);
        return this._hooks[hookName].map((hook) =>
          callbackFn(hook.hook(hookConfig))
        );
      };
    }

    return hookFunction;
  }
}

export = AddonLoader;
