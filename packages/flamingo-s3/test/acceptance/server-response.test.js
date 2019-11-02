"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const assert = require("assert");
const merge = require("lodash.merge");
const nock = require("nock");
const path = require("path");
const fs = require("fs");
const S3rver = require("s3rver");
const Promise = require("bluebird");
const AWS = require("aws-sdk");
const got = require("got");
const Server = require("flamingo/src/model/server");
const Config = require("flamingo/config");
const AddonLoader = require("flamingo/src/addon/loader");
const exampleProfiles = require("flamingo/src/profiles/examples");
const S3Route = require("../../src/route");
const stat = Promise.promisify(fs.stat);
const PORT = 43723; // some random unused port
const AWS_ENDPOINT = "localhost:4567";
const AWS_REGION = "us-east-1";
const AWS_SECRET = "abc";
const AWS_ACCESS_KEY = "123";
const noop = () => { };
function startServer(localConf) {
    return Config.fromEnv().then(config => {
        config = merge({}, config, { PORT }, localConf);
        return new Server(config, 
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        { hook: () => noop })
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
                s3ForcePathStyle: true
            }).run(err => {
                if (err) {
                    return reject(err);
                }
                resolve(runningServer);
            });
        });
        AWS.config.update({
            // config for fake s3 server (only used in testing)
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            endpoint: new AWS.Endpoint(AWS_ENDPOINT),
            region: AWS_REGION,
            sslEnabled: false,
            s3ForcePathStyle: true,
            credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET)
        });
    });
    afterEach(function (done) {
        this.fakes3.close(done);
    });
    afterEach(function () {
        nock.cleanAll();
    });
    it("returns 400 for unknown bucket alias, bad key format and unknown profile", async function () {
        const server = await startServer({
            AWS: {
                ENDPOINT: AWS_ENDPOINT,
                REGION: AWS_REGION,
                ACCESS_KEY: AWS_ACCESS_KEY,
                SECRET: AWS_SECRET,
                S3: {
                    BUCKETS: {
                        cats: {
                            name: "secret-cats-bucket-name",
                            path: "bucket-path/"
                        }
                    }
                }
            }
        });
        const responses = await Promise.all([
            // unknown alias
            got(`http://localhost:${PORT}/s3/dogs/avatar-image/123`).catch(e => e),
            // unknown profile
            got(`http://localhost:${PORT}/s3/cats/avatar-image/123`).catch(e => e),
            // bad key format
            got(`http://localhost:${PORT}/s3/cats/unknown-profile/foo-bar`).catch(e => e)
        ]);
        responses.forEach(response => assert.equal(response.statusCode, 400));
        return server.stop();
    });
    it("configures AWS from given config", async function () {
        let config = await Config.fromEnv();
        config = merge({}, config, {
            PORT,
            AWS: {
                ACCESS_KEY: "123",
                SECRET: "abc"
            }
        });
        // manually load module as addon
        const loader = new AddonLoader(path.join(__dirname, "..", ".."), {
            "flamingo-s3": "*"
        });
        loader.addons = [
            {
                pkg: require("../../package.json"),
                path: path.join(__dirname, "..", ".."),
                hooks: require("../../index")
            }
        ];
        loader.finalize(loader.reduceAddonsToHooks(loader.addons, loader._hooks));
        const server = await new Server(config, loader.load())
            .withProfiles([exampleProfiles])
            .withRoutes([new S3Route(config)])
            .start();
        const s3Client = 
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        server.s3Client;
        assert.equal(s3Client.config.credentials.accessKeyId, "123");
        assert.equal(s3Client.config.credentials.secretAccessKey, "abc");
        return server.stop();
    });
    it("returns the image for valid s3 objects", async function () {
        const bucketName = "secret-cats-bucket-name";
        const fileDir = "fixtures/";
        const file = "fixture.jpg";
        const fixture = path.join(__dirname, "../fixtures/23797956634_d90e17a27a_o.jpg");
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
                            path: "cats/"
                        }
                    }
                }
            }
        });
        // manually load module as addon
        const loader = new AddonLoader(path.join(__dirname, "..", ".."), {
            "flamingo-s3": "*"
        });
        loader.addons = [
            {
                pkg: require("../../package.json"),
                path: path.join(__dirname, "..", ".."),
                hooks: require("../../index")
            }
        ];
        loader.finalize(loader.reduceAddonsToHooks(loader.addons, loader._hooks));
        const server = await new Server(config, loader.load())
            .withProfiles([exampleProfiles])
            .withRoutes([new S3Route(config)])
            .start();
        AWS.config.update({
            // config for fake s3 server (only used in testing)
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            endpoint: new AWS.Endpoint(AWS_ENDPOINT),
            region: AWS_REGION,
            sslEnabled: false,
            s3ForcePathStyle: true,
            credentials: new AWS.Credentials(AWS_ACCESS_KEY, AWS_SECRET)
        });
        const { size } = (await stat(fixture));
        const s3Client = 
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        server.s3Client;
        await s3Client.createBucket({ Bucket: bucketName }).promise();
        await s3Client
            .putObject({
            Bucket: bucketName,
            Key: "cats/" + fileDir + file,
            ContentLength: size,
            Body: fs.createReadStream(fixture)
        })
            .promise();
        const response = await got(`http://localhost:${PORT}/s3/cats/avatar-image/fixtures-fixture.jpg`);
        assert.equal(response.statusCode, 200);
        return server.stop();
    });
});
