const assert = require('assert');
const Loader = require('../../../src/addon/loader');
const path = require('path');

function loader() {
  return new Loader(path.join(__dirname, '../../fixtures'), {});
}

describe('addon setup examples', function () {

  it('IMG_PIPE hook that processes a given list of operations', function () {
    const hooks = {};
    const pipe = [
      {id: 'format', format: 'jpg'},
      {id: 'resize', w: 200, h: 300}
    ];
    const addons = [{
      pkg: {name: 'force-webp'}, hooks: {
        'IMG_PIPE': function (supports) {
          return function (pipe) {
            return supports.webp ? pipe.map(function (p) {
              if (p.id === 'format') {
                return {id: 'format', format: 'webp'};
              }
              return p;
            }) : pipe;
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
    }];
    const _loader = loader();
    const reduced = _loader.reduceAddonsToHooks(addons, hooks);

    _loader.callback('IMG_PIPE', function (pipe) {
      return function (addonTransform) {
        pipe = addonTransform(pipe);
        return pipe;
      };
    });

    _loader.finalize(reduced);

    const supports = {webp: true};
    const addResults = _loader.hook('IMG_PIPE', supports)(pipe);
    const lastResult = addResults[addResults.length - 1];

    assert.deepEqual(lastResult, [{id: 'format', format: 'webp'}]);

    _loader.unload();
  });

});
