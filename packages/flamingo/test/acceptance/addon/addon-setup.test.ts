import assert = require("assert");
import path = require("path");

import Loader = require("../../../src/addon/loader");

function loader() {
  return new Loader(path.join(__dirname, "../../fixtures"), {});
}

type Supports = { webp: boolean };
type Op = { id: string; [arg: string]: any };

describe("addon setup examples", function () {
  it("IMG_PIPE hook that processes a given list of operations", function () {
    const hooks = {};
    const pipe = [
      { id: "format", format: "jpg" },
      { id: "resize", w: 200, h: 300 },
    ];
    const addons = [
      {
        pkg: { name: "force-webp" },
        hooks: {
          IMG_PIPE(supports: Supports) {
            return function (pipe: Op[]) {
              return supports.webp
                ? pipe.map(function (p) {
                    if (p.id === "format") {
                      return { id: "format", format: "webp" };
                    }
                    return p;
                  })
                : pipe;
            };
          },
        },
      },
      {
        pkg: { name: "force-square" },
        hooks: {
          IMG_PIPE() {
            return function (pipe: Op[]) {
              return pipe.map(function (p) {
                if (p.id === "resize") {
                  return { id: "resize", w: p.w, h: p.w };
                }
                return p;
              });
            };
          },
        },
      },
      {
        pkg: { name: "skip-resize" },
        hooks: {
          IMG_PIPE() {
            return (pipe: Op[]) => pipe.filter((p) => p.id !== "resize");
          },
        },
      },
    ];
    const _loader = loader();
    const reduced = _loader.reduceAddonsToHooks(addons, hooks);

    _loader.callback("IMG_PIPE", function (pipe) {
      return function (addonTransform: any) {
        pipe = addonTransform(pipe);
        return pipe;
      };
    });

    _loader.finalize(reduced);

    const supports: Supports = { webp: true };
    const addResults = _loader.hook("IMG_PIPE", supports)(pipe);
    const lastResult = addResults[addResults.length - 1];

    assert.deepStrictEqual(lastResult, [{ id: "format", format: "webp" }]);

    _loader.unload();
  });
});
