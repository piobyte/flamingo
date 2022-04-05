import assert = require("assert");
import path = require("path");
import fs = require("fs");
import url = require("url");
import got from "got";

import simpleHttpServer = require("../test-util/simple-http-server");
import IServer from "../test-util/IServer";

const ASSETS_PORT = 9999;
const ASSETS_HOST = "localhost";
const FLAMINGO_PORT = 4000;
const HOST = ASSETS_HOST;

interface TutorialTestDescription {
  file: string;
  url: string;
  skip?: boolean;
  ok?: (response: any) => any;
  error?: (response: any) => any;
}

const IMAGE_URL = encodeURIComponent(
  url.format({
    protocol: "http",
    hostname: ASSETS_HOST,
    port: ASSETS_PORT,
    pathname: "/Landscape_5.jpg",
  })
);

const expected: Array<TutorialTestDescription> = [
  {
    file: "image-meta.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/image/${IMAGE_URL}`,
    }),
    ok(response) {
      assert.deepStrictEqual(JSON.parse(response.body), {
        format: "jpeg",
        width: 450,
        height: 600,
        space: "srgb",
        channels: 3,
        chromaSubsampling: "4:2:0",
        density: 72,
        depth: "uchar",
        hasProfile: true,
        hasAlpha: false,
        size: 137611,
        isProgressive: false,
        orientation: 5,
        exif: {
          type: "Buffer",
          data: [
            69, 120, 105, 102, 0, 0, 77, 77, 0, 42, 0, 0, 0, 8, 0, 5, 1, 18, 0,
            3, 0, 0, 0, 1, 0, 5, 0, 0, 1, 26, 0, 5, 0, 0, 0, 1, 0, 0, 0, 74, 1,
            27, 0, 5, 0, 0, 0, 1, 0, 0, 0, 82, 1, 40, 0, 3, 0, 0, 0, 1, 0, 2, 0,
            0, 135, 105, 0, 4, 0, 0, 0, 1, 0, 0, 0, 90, 0, 0, 0, 0, 0, 0, 0, 72,
            0, 0, 0, 1, 0, 0, 0, 72, 0, 0, 0, 1, 0, 2, 160, 2, 0, 4, 0, 0, 0, 1,
            0, 0, 1, 194, 160, 3, 0, 4, 0, 0, 0, 1, 0, 0, 2, 88, 0, 0, 0, 0,
          ],
        },
        icc: {
          type: "Buffer",
          data: [
            0, 0, 7, 168, 97, 112, 112, 108, 2, 32, 0, 0, 109, 110, 116, 114,
            82, 71, 66, 32, 88, 89, 90, 32, 7, 217, 0, 2, 0, 25, 0, 11, 0, 26,
            0, 11, 97, 99, 115, 112, 65, 80, 80, 76, 0, 0, 0, 0, 97, 112, 112,
            108, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 246, 214,
            0, 1, 0, 0, 0, 0, 211, 45, 97, 112, 112, 108, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 100, 101,
            115, 99, 0, 0, 1, 8, 0, 0, 0, 111, 100, 115, 99, 109, 0, 0, 1, 120,
            0, 0, 5, 108, 99, 112, 114, 116, 0, 0, 6, 228, 0, 0, 0, 56, 119,
            116, 112, 116, 0, 0, 7, 28, 0, 0, 0, 20, 114, 88, 89, 90, 0, 0, 7,
            48, 0, 0, 0, 20, 103, 88, 89, 90, 0, 0, 7, 68, 0, 0, 0, 20, 98, 88,
            89, 90, 0, 0, 7, 88, 0, 0, 0, 20, 114, 84, 82, 67, 0, 0, 7, 108, 0,
            0, 0, 14, 99, 104, 97, 100, 0, 0, 7, 124, 0, 0, 0, 44, 98, 84, 82,
            67, 0, 0, 7, 108, 0, 0, 0, 14, 103, 84, 82, 67, 0, 0, 7, 108, 0, 0,
            0, 14, 100, 101, 115, 99, 0, 0, 0, 0, 0, 0, 0, 20, 71, 101, 110,
            101, 114, 105, 99, 32, 82, 71, 66, 32, 80, 114, 111, 102, 105, 108,
            101, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 71, 101, 110, 101, 114,
            105, 99, 32, 82, 71, 66, 32, 80, 114, 111, 102, 105, 108, 101, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 109, 108, 117, 99, 0, 0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 12, 115,
            107, 83, 75, 0, 0, 0, 40, 0, 0, 1, 120, 104, 114, 72, 82, 0, 0, 0,
            40, 0, 0, 1, 160, 99, 97, 69, 83, 0, 0, 0, 36, 0, 0, 1, 200, 112,
            116, 66, 82, 0, 0, 0, 38, 0, 0, 1, 236, 117, 107, 85, 65, 0, 0, 0,
            42, 0, 0, 2, 18, 102, 114, 70, 85, 0, 0, 0, 40, 0, 0, 2, 60, 122,
            104, 84, 87, 0, 0, 0, 22, 0, 0, 2, 100, 105, 116, 73, 84, 0, 0, 0,
            40, 0, 0, 2, 122, 110, 98, 78, 79, 0, 0, 0, 38, 0, 0, 2, 162, 107,
            111, 75, 82, 0, 0, 0, 22, 0, 0, 2, 200, 99, 115, 67, 90, 0, 0, 0,
            34, 0, 0, 2, 222, 104, 101, 73, 76, 0, 0, 0, 30, 0, 0, 3, 0, 100,
            101, 68, 69, 0, 0, 0, 44, 0, 0, 3, 30, 104, 117, 72, 85, 0, 0, 0,
            40, 0, 0, 3, 74, 115, 118, 83, 69, 0, 0, 0, 38, 0, 0, 2, 162, 122,
            104, 67, 78, 0, 0, 0, 22, 0, 0, 3, 114, 106, 97, 74, 80, 0, 0, 0,
            26, 0, 0, 3, 136, 114, 111, 82, 79, 0, 0, 0, 36, 0, 0, 3, 162, 101,
            108, 71, 82, 0, 0, 0, 34, 0, 0, 3, 198, 112, 116, 80, 79, 0, 0, 0,
            38, 0, 0, 3, 232, 110, 108, 78, 76, 0, 0, 0, 40, 0, 0, 4, 14, 101,
            115, 69, 83, 0, 0, 0, 38, 0, 0, 3, 232, 116, 104, 84, 72, 0, 0, 0,
            36, 0, 0, 4, 54, 116, 114, 84, 82, 0, 0, 0, 34, 0, 0, 4, 90, 102,
            105, 70, 73, 0, 0, 0, 40, 0, 0, 4, 124, 112, 108, 80, 76, 0, 0, 0,
            44, 0, 0, 4, 164, 114, 117, 82, 85, 0, 0, 0, 34, 0, 0, 4, 208, 97,
            114, 69, 71, 0, 0, 0, 38, 0, 0, 4, 242, 101, 110, 85, 83, 0, 0, 0,
            38, 0, 0, 5, 24, 100, 97, 68, 75, 0, 0, 0, 46, 0, 0, 5, 62, 0, 86,
            1, 97, 0, 101, 0, 111, 0, 98, 0, 101, 0, 99, 0, 110, 0, 253, 0, 32,
            0, 82, 0, 71, 0, 66, 0, 32, 0, 112, 0, 114, 0, 111, 0, 102, 0, 105,
            0, 108, 0, 71, 0, 101, 0, 110, 0, 101, 0, 114, 0, 105, 1, 13, 0,
            107, 0, 105, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 112, 0, 114, 0,
            111, 0, 102, 0, 105, 0, 108, 0, 80, 0, 101, 0, 114, 0, 102, 0, 105,
            0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 103, 0, 101, 0, 110,
            0, 232, 0, 114, 0, 105, 0, 99, 0, 80, 0, 101, 0, 114, 0, 102, 0,
            105, 0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 71, 0, 101, 0,
            110, 0, 233, 0, 114, 0, 105, 0, 99, 0, 111, 4, 23, 4, 48, 4, 51, 4,
            48, 4, 59, 4, 76, 4, 61, 4, 56, 4, 57, 0, 32, 4, 63, 4, 64, 4, 62,
            4, 68, 4, 48, 4, 57, 4, 59, 0, 32, 0, 82, 0, 71, 0, 66, 0, 80, 0,
            114, 0, 111, 0, 102, 0, 105, 0, 108, 0, 32, 0, 103, 0, 233, 0, 110,
            0, 233, 0, 114, 0, 105, 0, 113, 0, 117, 0, 101, 0, 32, 0, 82, 0, 86,
            0, 66, 144, 26, 117, 40, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 130,
            114, 95, 105, 99, 207, 143, 240, 0, 80, 0, 114, 0, 111, 0, 102, 0,
            105, 0, 108, 0, 111, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 103, 0,
            101, 0, 110, 0, 101, 0, 114, 0, 105, 0, 99, 0, 111, 0, 71, 0, 101,
            0, 110, 0, 101, 0, 114, 0, 105, 0, 115, 0, 107, 0, 32, 0, 82, 0, 71,
            0, 66, 0, 45, 0, 112, 0, 114, 0, 111, 0, 102, 0, 105, 0, 108, 199,
            124, 188, 24, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 213, 4, 184, 92,
            211, 12, 199, 124, 0, 79, 0, 98, 0, 101, 0, 99, 0, 110, 0, 253, 0,
            32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 112, 0, 114, 0, 111, 0, 102, 0,
            105, 0, 108, 5, 228, 5, 232, 5, 213, 5, 228, 5, 217, 5, 220, 0, 32,
            0, 82, 0, 71, 0, 66, 0, 32, 5, 219, 5, 220, 5, 220, 5, 217, 0, 65,
            0, 108, 0, 108, 0, 103, 0, 101, 0, 109, 0, 101, 0, 105, 0, 110, 0,
            101, 0, 115, 0, 32, 0, 82, 0, 71, 0, 66, 0, 45, 0, 80, 0, 114, 0,
            111, 0, 102, 0, 105, 0, 108, 0, 193, 0, 108, 0, 116, 0, 97, 0, 108,
            0, 225, 0, 110, 0, 111, 0, 115, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32,
            0, 112, 0, 114, 0, 111, 0, 102, 0, 105, 0, 108, 102, 110, 144, 26,
            0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 99, 207, 143, 240, 101, 135, 78,
            246, 78, 0, 130, 44, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 48, 215, 48,
            237, 48, 213, 48, 161, 48, 164, 48, 235, 0, 80, 0, 114, 0, 111, 0,
            102, 0, 105, 0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 103, 0,
            101, 0, 110, 0, 101, 0, 114, 0, 105, 0, 99, 3, 147, 3, 181, 3, 189,
            3, 185, 3, 186, 3, 204, 0, 32, 3, 192, 3, 193, 3, 191, 3, 198, 3,
            175, 3, 187, 0, 32, 0, 82, 0, 71, 0, 66, 0, 80, 0, 101, 0, 114, 0,
            102, 0, 105, 0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 103, 0,
            101, 0, 110, 0, 233, 0, 114, 0, 105, 0, 99, 0, 111, 0, 65, 0, 108,
            0, 103, 0, 101, 0, 109, 0, 101, 0, 101, 0, 110, 0, 32, 0, 82, 0, 71,
            0, 66, 0, 45, 0, 112, 0, 114, 0, 111, 0, 102, 0, 105, 0, 101, 0,
            108, 14, 66, 14, 27, 14, 35, 14, 68, 14, 31, 14, 37, 14, 76, 0, 32,
            0, 82, 0, 71, 0, 66, 0, 32, 14, 23, 14, 49, 14, 72, 14, 39, 14, 68,
            14, 27, 0, 71, 0, 101, 0, 110, 0, 101, 0, 108, 0, 32, 0, 82, 0, 71,
            0, 66, 0, 32, 0, 80, 0, 114, 0, 111, 0, 102, 0, 105, 0, 108, 0, 105,
            0, 89, 0, 108, 0, 101, 0, 105, 0, 110, 0, 101, 0, 110, 0, 32, 0, 82,
            0, 71, 0, 66, 0, 45, 0, 112, 0, 114, 0, 111, 0, 102, 0, 105, 0, 105,
            0, 108, 0, 105, 0, 85, 0, 110, 0, 105, 0, 119, 0, 101, 0, 114, 0,
            115, 0, 97, 0, 108, 0, 110, 0, 121, 0, 32, 0, 112, 0, 114, 0, 111,
            0, 102, 0, 105, 0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 4, 30, 4, 49, 4,
            73, 4, 56, 4, 57, 0, 32, 4, 63, 4, 64, 4, 62, 4, 68, 4, 56, 4, 59,
            4, 76, 0, 32, 0, 82, 0, 71, 0, 66, 6, 69, 6, 68, 6, 65, 0, 32, 6,
            42, 6, 57, 6, 49, 6, 74, 6, 65, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32,
            6, 39, 6, 68, 6, 57, 6, 39, 6, 69, 0, 71, 0, 101, 0, 110, 0, 101, 0,
            114, 0, 105, 0, 99, 0, 32, 0, 82, 0, 71, 0, 66, 0, 32, 0, 80, 0,
            114, 0, 111, 0, 102, 0, 105, 0, 108, 0, 101, 0, 71, 0, 101, 0, 110,
            0, 101, 0, 114, 0, 101, 0, 108, 0, 32, 0, 82, 0, 71, 0, 66, 0, 45,
            0, 98, 0, 101, 0, 115, 0, 107, 0, 114, 0, 105, 0, 118, 0, 101, 0,
            108, 0, 115, 0, 101, 116, 101, 120, 116, 0, 0, 0, 0, 67, 111, 112,
            121, 114, 105, 103, 104, 116, 32, 50, 48, 48, 55, 32, 65, 112, 112,
            108, 101, 32, 73, 110, 99, 46, 44, 32, 97, 108, 108, 32, 114, 105,
            103, 104, 116, 115, 32, 114, 101, 115, 101, 114, 118, 101, 100, 46,
            0, 88, 89, 90, 32, 0, 0, 0, 0, 0, 0, 243, 82, 0, 1, 0, 0, 0, 1, 22,
            207, 88, 89, 90, 32, 0, 0, 0, 0, 0, 0, 116, 77, 0, 0, 61, 238, 0, 0,
            3, 208, 88, 89, 90, 32, 0, 0, 0, 0, 0, 0, 90, 117, 0, 0, 172, 115,
            0, 0, 23, 52, 88, 89, 90, 32, 0, 0, 0, 0, 0, 0, 40, 26, 0, 0, 21,
            159, 0, 0, 184, 54, 99, 117, 114, 118, 0, 0, 0, 0, 0, 0, 0, 1, 1,
            205, 0, 0, 115, 102, 51, 50, 0, 0, 0, 0, 0, 1, 12, 66, 0, 0, 5, 222,
            255, 255, 243, 38, 0, 0, 7, 146, 0, 0, 253, 145, 255, 255, 251, 162,
            255, 255, 253, 163, 0, 0, 3, 220, 0, 0, 192, 108,
          ],
        },
      });
    },
  },
  {
    // TODO: constant hash
    file: "hmac-image-convert.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/image/preview-image/a3fb18e9c39d61a654d85ed0f2a9954e1f2f4b42cbc4d04a0e3a6c58a2e46c39/${IMAGE_URL}`,
    }),
    ok(response) {
      assert.deepStrictEqual(response.statusCode, 200);
    },
  },
  {
    file: "hmac-image-convert.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/image/preview-image/eeeb18e9c39d61a654d85ed0f2a9954e1f2f4b42cbc4d04a0e3a6c58a2e46c39/${IMAGE_URL}`,
    }),
    error(response) {
      assert.strictEqual(response.statusCode, 400);
    },
  },
  {
    file: "markdown-to-image.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: "/md/preview-image/%23%20headline%0A%0Awasd?size=500",
    }),
    ok(response) {
      assert.deepStrictEqual(response.statusCode, 200);
    },
  },
  {
    file: "website-screenshot.js",
    // disable this test for node >= 11 as there's a bug in the unmaintained lib
    skip: parseInt(/v(.*?)\..*/.exec(process.version)![1], 10) >= 11,
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/www/preview-image/${IMAGE_URL}`,
    }),
    ok(response) {
      assert.deepStrictEqual(response.statusCode, 200);
    },
  },
  {
    file: "custom-urls.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/convert/image/preview-image/${IMAGE_URL}`,
    }),
    ok(response) {
      assert.deepStrictEqual(response.statusCode, 200);
    },
  },
  {
    file: "url-transformation-instructions.js",
    url: url.format({
      protocol: "http",
      hostname: HOST,
      port: FLAMINGO_PORT,
      pathname: `/inline/image/resize=300:100,toFormat=webp,rotate=90/${IMAGE_URL}`,
    }),
    ok(response) {
      assert.deepStrictEqual(response.statusCode, 200);
    },
  },
];

describe("tutorials work as expected", function () {
  let assetsServer: IServer;
  before(function () {
    return simpleHttpServer(
      (req, res) => {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        fs.createReadStream(
          path.join(
            __dirname,
            "../../test/fixtures/images/sharp-bench-assets",
            url.parse(req.url!).pathname!
          )
        ).pipe(res, { end: true });
      },
      ASSETS_PORT,
      ASSETS_HOST
    ).then((server) => (assetsServer = server));
  });

  after(function () {
    return assetsServer.stop();
  });

  expected.forEach(({ skip, file, url, ok, error }) => {
    const method = skip ? it.skip : it.skip;
    method(`${file}`, async function () {
      let server;

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        server = await require(path.join("../../tutorials", file))({
          HOST,
          PORT: FLAMINGO_PORT,
        });

        const request = got(url);
        await (error ? request.catch(error) : request.then(ok));
      } finally {
        server.stop();
      }
    });
  });
});
