var assert = require('assert');

describe('addon setup examples', function () {
  var loader = require('../../../src/addon/loader');

  it('IMG_PIPE hook that processes a given list of operations', function () {
    var hooks = {},
      pipe = [
        {id: 'format', format: 'jpg'},
        {id: 'resize', w: 200, h: 300}
      ],
      addons = [{
        pkg: {name: 'force-webp'}, hooks: {
          'IMG_PIPE': function () {
            return function (pipe) {
              return pipe.map(function (p) {
                if (p.id === 'format') {
                  return {id: 'format', format: 'webp'};
                }
                return p;
              });
            };
          }
        }
      }, {
        pkg: {name: 'force-square'}, hooks: {
          'IMG_PIPE': function () {
            return function (pipe) {
              return pipe.map(function (p) {
                if (p.id === 'resize') {
                  return {id: 'resize', w: p.w, h: p.w};
                }
                return p;
              });
            };
          }
        }
      }, {
        pkg: {name: 'skip-resize'}, hooks: {
          'IMG_PIPE': function () {
            return function (pipe) {
              return pipe.filter(function (p) {
                return p.id !== 'resize';
              });
            };
          }
        }
      }],
      registeredHooks = loader.registerAddonHooks(addons, hooks);

    loader.callback('IMG_PIPE', function (pipe) {
      return function (addonTransform) {
        pipe = addonTransform(pipe);
        return pipe;
      };
    });

    loader.finalize(loader, registeredHooks);

    var addResults = loader.hook('IMG_PIPE')(pipe),
      lastResult = addResults[addResults.length -1];

    assert.deepEqual(lastResult, [{id: 'format', format: 'webp'}]);

    loader.unload();
  });

});
