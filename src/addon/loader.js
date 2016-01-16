/* @flow */
/**
 * @module flamingo/src/addon/loader
 */
var addonDiscovery = require('./discovery'),
  assert = require('assert'),
  noop = require('lodash/utility/noop'),
  forOwn = require('lodash/object/forOwn'),
  callbacks = require('./callbacks'),
  reduce = require('lodash/collection/reduce');

var _callbacks = {},
  logger = require('./../logger').build('addon-loader');

/*eslint no-underscore-dangle: 0 */
var _hooks/*: {[key: string]: []} */ = {},
  _loaded = false;

exports.load = load;
exports.unload = unload;
exports.finalize = finalize;
exports.callback = callback;
exports.hook = hook;
exports.registerAddonHooks = registerAddonHooks;

function unload() {
  _loaded = false;
  _hooks = {};
}

/**
 * Function to load all addons starting from a given root using a given pkg
 * @param {string} root root path
 * @param {object} pkg package.json object
 * @param {String} [nodeModulesDir=node_modules] node module dirname
 * @returns {void}
 */
function load(root/*: string */, pkg/*: Object */, nodeModulesDir/*: string */) {
  var addons = addonDiscovery.discover(root, pkg, nodeModulesDir);

  /* istanbul ignore next */
  if (addons.length) {
    logger.info('using addons: ' + addons.map(function (addon) {
      return addon.pkg.name + '@' + addon.pkg.version;
    }).join(', '));
  }

  finalize(exports,
    registerAddonHooks(addons, _hooks));
}

/**
 * Finalizes the addon loading process by setting the hooks and registering all callbacks for each one.
 * This function has to be called before the `hook` method is available.
 * @param {object} loader
 * @param {object} hooks
 */
function finalize(loader/*: {callback: function} */, hooks/*: {} */) {
  _hooks = hooks;
  callbacks(loader);
  _loaded = true;
}

function registerAddonHooks(addons/* {hooks: {}} */, loaderHooks/*: {[key: string]: []} */)/*: {} */ {
  return reduce(addons, function (hooks, addon) {
    forOwn(addon.hooks, function (val, key) {
      if (!hooks[key]) {
        hooks[key] = [];
      }

      hooks[key].push({
        hook: addon.hooks[key],
        addon: addon
      });
    });
    return hooks;
  }, loaderHooks);
}

/**
 * Register a callback for a given hook name
 * @param {string} hookName name of the hook
 * @param {function} callback hook function
 */
function callback(hookName/*: string */, callback/*: function */) {
  _callbacks[hookName] = callback;
}

/**
 * Creates a function that can be called with additional params that calls all addons for a given hook.
 * @param {string} hookName name of the hook
 * @param {object} hookConfig config object that is provided to each hook
 * @return {function} generated hook function
 */
function hook(hookName/*: string */, hookConfig/*: any */)/*: function */ {
  assert(_loaded, 'addons have to be loaded before calling any hooks');
  assert(_callbacks[hookName], 'no registered callback for ' + hookName);

  var hookFunction = noop;

  if (_hooks[hookName]) {
    hookFunction = function () {
      /*eslint camelcase:0*/
      // @via https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
      var $_len = arguments.length;
      var args = new Array($_len);
      for (var $_i = 0; $_i < $_len; ++$_i) {
        args[$_i] = arguments[$_i];
      }

      var results = [],
        callbackFn = _callbacks[hookName].apply(undefined, args);

      for (var i = 0; i < _hooks[hookName].length; i++) {
        results.push(callbackFn(_hooks[hookName][i].hook(hookConfig)));
      }

      return results;
    };
  }

  return hookFunction;
}
