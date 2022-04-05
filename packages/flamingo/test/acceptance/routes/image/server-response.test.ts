import assert = require("assert");
import merge = require("lodash/merge");
import nock = require("nock");
import range = require("lodash/range");
import got from "got";

import Server = require("../../../../src/model/server");
import Config = require("../../../../config");
import NoopAddonLoader = require("../../../test-util/NoopAddonLoader");
import exampleProfiles = require("../../../../src/profiles/examples");
import ImageRoute = require("../../../../src/routes/image");

const PORT = 43723; // some random unused port

async function startServer(localConf: Config) {
  let config = await Config.fromEnv();
  config = merge({}, config, { CRYPTO: { ENABLED: false }, PORT }, localConf);

  return new Server(config, new NoopAddonLoader())
    .withProfiles([exampleProfiles])
    .withRoutes([new ImageRoute(config)])
    .start();
}

describe("image converting server response", function () {
  afterEach(function () {
    nock.enableNetConnect();
    nock.cleanAll();
  });

  it("returns 400 for all target error codes", async function () {
    let server;
    const codes = range(400, 600);
    let endpoint = nock("https://errs.example.com");

    codes.forEach(
      (code) => (endpoint = endpoint.get("/" + code).reply(code, {}))
    );

    try {
      server = await startServer({
        ACCESS: {
          HTTPS: {
            ENABLED: true,
            READ: [{ hostname: "errs.example.com" }],
          },
        },
      });
      const data = await Promise.all(
        codes.map((code) =>
          got(
            `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
              `https://errs.example.com/${code}`
            )}`,
            {
              retry: 0,
              followRedirect: false,
            }
          ).catch((data) => data)
        )
      );
      data.forEach(({ response }) =>
        assert.strictEqual((response as any).statusCode, 400)
      );
    } finally {
      server?.stop();
    }
  });

  it("returns 400 for not whitelisted urls", async function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
      "https://old.example.com/image.png"
    )}`;
    let server;

    try {
      server = await startServer({
        ACCESS: {
          HTTPS: {
            ENABLED: true,
            READ: [{ hostname: "errs.example.com" }],
          },
        },
      });
      const { response } = await got(URL).catch((e) => e);
      assert.strictEqual(response.statusCode, 400);
    } finally {
      server?.stop();
    }
  });

  it("rejects redirects by default", async function () {
    nock("https://redir.example.com").get("/moved.jpg").reply(
      301,
      { status: "moved" },
      {
        Location: "https://redir.example.com/url.jpg",
      }
    );

    const URL = `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
      "https://redir.example.com/moved.jpg"
    )}`;
    let server;

    try {
      server = await startServer({});
      const { response } = await got(URL).catch((e) => e);

      assert.strictEqual(response.statusCode, 400);
    } finally {
      server?.stop();
    }
  });

  it("allows redirect if enabled", async function () {
    nock("http://redir.example.com")
      .get("/moved.png")
      .reply(
        301,
        { status: "moved" },
        {
          Location: "http://redir.example.com/url.png",
        }
      )
      .get("/url.png")
      .replyWithFile(200, __dirname + "/../../../fixtures/images/base64.png");

    const URL = `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
      "http://redir.example.com/moved.png"
    )}`;
    let server;

    try {
      server = await startServer({
        ALLOW_READ_REDIRECT: true,
      });
      const response = await got(URL);
      assert.strictEqual(response.statusCode, 200);
    } finally {
      server?.stop();
    }
  });

  it("rejects unknown protocols (no reader available)", async function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
      "ftp://ftp.example.com/moved.jpg"
    )}`;
    let server;

    try {
      server = await startServer({});
      const { response } = await got(URL).catch((e) => e);
      assert.strictEqual(response.statusCode, 400);
    } finally {
      server?.stop();
    }
  });

  it("rejects unknown profile", async function () {
    const URL = `http://localhost:${PORT}/image/foo/${encodeURIComponent(
      "http://ftp.example.com/moved.jpg"
    )}`;
    let server;

    try {
      server = await startServer({});
      const { response } = await got(URL).catch((e) => e);
      assert.strictEqual(response.statusCode, 400);
    } finally {
      server?.stop();
    }
  });

  it("fails for decryption errors", async function () {
    const URL = `http://localhost:${PORT}/image/avatar-image/${encodeURIComponent(
      "http://ftp.example.com/moved.jpg"
    )}`;
    let server;

    try {
      server = await startServer({
        CRYPTO: { ENABLED: true },
      } as unknown as Config);
      const { response } = await got(URL).catch((e) => e);
      assert.strictEqual(response.statusCode, 400);
    } finally {
      server?.stop();
    }
  });
});
