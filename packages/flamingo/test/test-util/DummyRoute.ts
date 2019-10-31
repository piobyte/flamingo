import Route = require("../../src/model/route");

class DummyRoute extends Route {
  path = "dummy";

  constructor() {
    super({}, "GET", "/dummy", "dummy route");
  }
}

export = DummyRoute;
