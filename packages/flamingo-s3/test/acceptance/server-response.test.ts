/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/ban-ts-comment */
import assert = require("assert");
// @ts-ignore
import merge = require("lodash.merge");
import nock = require("nock");
import path = require("path");
import fs = require("fs");
// @ts-ignore
import S3rver = require("s3rver");

import util = require("util");
import AWS = require("aws-sdk");
import got from "got";
import Server = require("flamingo/src/model/server");
import Config = require("flamingo/config");
import AddonLoader = require("flamingo/src/addon/loader");
import exampleProfiles = require("flamingo/src/profiles/examples");
import S3Route = require("../../src/route");

const stat = util.promisify(fs.stat);

const PORT = 43723; // some random unused port
const AWS_ENDPOINT = "localhost:4567";
const AWS_REGION = "us-east-1";
const AWS_SECRET = "abc";
const AWS_ACCESS_KEY = "123";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

function startServer(localConf: Config) {
  return Config.fromEnv().then((config) => {
    config = merge({}, config, { PORT }, localConf);

    return new Server(
      config,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { hook: () => noop }
    )
      .withProfiles([exampleProfiles])
      .withRoutes([new S3Route(config)])
      .start();
  });
}

describe("flamingo-s3 server response", function () {
  beforeEach(async function () {
    this.fakes3 = await new Promise((resolve, reject) => {
      const runningServer = new S3rver({
        port: 4567,
        hostname: "localhost",
        silent: false,
        s3ForcePathStyle: true,
      }).run((err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve(runningServer);
      });
    });

    AWS.config.update({
      // config for fake s3 server (only used in testing)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      endpoint: new AWS.Endpoint(AWS_ENDPOINT),
      region: AWS_REGION,
      sslEnabled: false,
      s3ForcePathStyle: true,
      credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET),
    });
  });

  afterEach(function (done) {
    this.fakes3.close(done);
  });
  afterEach(function () {
    nock.cleanAll();
  });

  it("returns 400 for unknown bucket (#32), unknown bucket alias, bad key format and unknown profile", async function () {
    const server = await startServer({
      AWS: {
        ENDPOINT: AWS_ENDPOINT,
        REGION: AWS_REGION,
        ACCESS_KEY: AWS_ACCESS_KEY,
        SECRET: AWS_SECRET,
        S3: {
          BUCKETS: {
            unknown: {
              name: "unknown",
              path: "unknown/",
            },
            cats: {
              name: "secret-cats-bucket-name",
              path: "bucket-path/",
            },
          },
        },
      },
    });

    const responses = await Promise.all([
      // unknown bucket
      got(`http://localhost:${PORT}/s3/unknown/avatar-image/123`).catch(
        (e) => e
      ),
      // unknown alias
      got(`http://localhost:${PORT}/s3/dogs/avatar-image/123`).catch((e) => e),
      // unknown profile
      got(`http://localhost:${PORT}/s3/cats/avatar-image/123`).catch((e) => e),
      // bad key format
      got(`http://localhost:${PORT}/s3/cats/unknown-profile/foo-bar`).catch(
        (e) => e
      ),
    ]);

    responses.forEach(({ response }) =>
      assert.strictEqual(response.statusCode, 400)
    );

    return server.stop();
  });

  it("configures AWS from given config", async function () {
    let config = await Config.fromEnv();

    config = merge({}, config, {
      PORT,
      AWS: {
        ACCESS_KEY: "123",
        SECRET: "abc",
      },
    });

    // manually load module as addon
    const loader = new AddonLoader(path.join(__dirname, "..", ".."), {
      dependencies: {
        "flamingo-s3": "*",
      },
    });
    loader.addons = [
      {
        pkg: require("../../package.json"),
        path: path.join(__dirname, "..", ".."),
        hooks: require("../../index"),
      },
    ];
    loader.finalize(loader.reduceAddonsToHooks(loader.addons, loader._hooks));

    const server = await new Server(config, loader.load())
      .withProfiles([exampleProfiles])
      .withRoutes([new S3Route(config)])
      .start();

    const s3Client: AWS.S3 =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      server.s3Client;
    assert.strictEqual(s3Client.config.credentials!.accessKeyId, "123");
    assert.strictEqual(s3Client.config.credentials!.secretAccessKey, "abc");

    return server.stop();
  });

  it("returns the image for valid s3 objects", async function () {
    const bucketName = "secret-cats-bucket-name";
    const fileDir = "fixtures/";
    const file = "fixture.jpg";
    const fixture = path.join(
      __dirname,
      "../fixtures/23797956634_d90e17a27a_o.jpg"
    );

    let config = await Config.fromEnv();

    config = merge({}, config, {
      PORT,
      AWS: {
        ENDPOINT: AWS_ENDPOINT,
        REGION: AWS_REGION,
        ACCESS_KEY: AWS_ACCESS_KEY,
        SECRET: AWS_SECRET,
        S3: {
          BUCKETS: {
            cats: {
              name: bucketName,
              path: "cats/",
            },
          },
        },
      },
    });

    // manually load module as addon
    const loader = new AddonLoader(path.join(__dirname, "..", ".."), {
      dependencies: {
        "flamingo-s3": "*",
      },
    });
    loader.addons = [
      {
        pkg: require("../../package.json"),
        path: path.join(__dirname, "..", ".."),
        hooks: require("../../index"),
      },
    ];
    loader.finalize(loader.reduceAddonsToHooks(loader.addons, loader._hooks));

    const server = await new Server(config, loader.load())
      .withProfiles([exampleProfiles])
      .withRoutes([new S3Route(config)])
      .start();

    AWS.config.update({
      // config for fake s3 server (only used in testing)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      endpoint: new AWS.Endpoint(AWS_ENDPOINT),
      region: AWS_REGION,
      sslEnabled: false,
      s3ForcePathStyle: true,
      credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET),
    });

    const { size } = (await stat(fixture)) as { size: number };
    const s3Client: AWS.S3 =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      server.s3Client;

    await s3Client.createBucket({ Bucket: bucketName }).promise();
    await s3Client
      .putObject({
        Bucket: bucketName,
        Key: "cats/" + fileDir + file,
        ContentLength: size,
        Body: fs.createReadStream(fixture),
      })
      .promise();
    const response = await got(
      `http://localhost:${PORT}/s3/cats/avatar-image/fixtures-fixture.jpg`
    );
    assert.strictEqual(response.statusCode, 200);
    return server.stop();
  });
});
