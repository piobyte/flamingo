import AddonLoader = require("../../src/addon/loader");

class NoopAddonLoader extends AddonLoader {
  constructor() {
    super("", {});
  }
  hook(hookName: string) {
    return () => [];
  }
}

export = NoopAddonLoader;
