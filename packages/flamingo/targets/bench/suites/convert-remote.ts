import url = require("url");
import Benchmark = require("benchmark");
import httpReader = require("../../../src/reader/https");
import fs = require("fs");
import FlamingoOperation = require("../../../src/model/flamingo-operation");
import simpleServer = require("../../../test/test-util/simple-http-server");
import { Deferred } from "benchmark";
import IServer from "../../../test/test-util/IServer";

const IMAGE_HOST = "127.0.0.1";
const IMAGE_HOST_PORT = 43722; // some random unused port
const HOST = url.format({
  protocol: "http",
  hostname: IMAGE_HOST,
  port: IMAGE_HOST_PORT,
  pathname: "/Saturn_from_Cassini_Orbiter_(2004-10-06).jpg",
});
const PARSED_HOST = url.parse(HOST);

function error(err: Error) {
  /* eslint no-console: 0 */
  console.error(err);
}

module.exports = function (suiteConfig: any) {
  return function (suiteName: string, description: string, filePath: string) {
    let server: IServer;
    let prom: Promise<any> = simpleServer(
      function (req, res) {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        fs.createReadStream(filePath).pipe(res, { end: true });
      },
      IMAGE_HOST_PORT,
      IMAGE_HOST
    ).then((s) => {
      server = s;
    });

    const convertRemote = function (profileName: string) {
      return new Promise(function (resolve) {
        new Benchmark.Suite(description)
          .add("GM", {
            defer: true,
            fn: function (deferred: Deferred) {
              const op = new FlamingoOperation();
              op.input = PARSED_HOST;
              op.config = {
                ACCESS: { HTTPS: { ENABLED: false } },
                ALLOW_READ_REDIRECT: false,
                READER: { REQUEST: { TIMEOUT: 2000 } },
              };
              httpReader(op)
                .then(function (data) {
                  return data.stream().then(function (rstream) {
                    return suiteConfig.profiles[profileName](
                      {
                        headers: {},
                        query: { processor: "gm" },
                      },
                      {
                        DEFAULT_MIME: "image/png",
                      }
                    ).then(function (profileData: any) {
                      const wstream = suiteConfig.temp.createWriteStream();
                      const op = new FlamingoOperation();
                      let error: Error;

                      op.process = profileData.process;
                      op.config = {};

                      wstream.on("finish", function () {
                        if (error) {
                          deferred.benchmark.abort();
                        }
                        deferred.resolve();
                      });
                      wstream.on("error", function (err: Error) {
                        error = err;
                        wstream.end();
                      });
                      const processorStream = suiteConfig.imageProcessors(op)(
                        rstream
                      );
                      processorStream.on("error", function (err: Error) {
                        error = err;
                        wstream.end();
                        processorStream.end();
                      });
                      processorStream.pipe(wstream);
                    });
                  });
                })
                .catch(error);
            },
          })
          .add("VIPS", {
            defer: true,
            fn: function (deferred: Deferred) {
              const op = new FlamingoOperation();
              op.input = PARSED_HOST;
              op.config = {
                ACCESS: { HTTPS: { ENABLED: false } },
                ALLOW_READ_REDIRECT: false,
                READER: { REQUEST: { TIMEOUT: 2000 } },
              };
              httpReader(op)
                .then(function (data) {
                  return data.stream().then(function (rstream) {
                    return suiteConfig.profiles[profileName](
                      {
                        headers: {},
                        query: {},
                      },
                      {
                        DEFAULT_MIME: "image/png",
                      }
                    ).then(function (profileData: any) {
                      const wstream = suiteConfig.temp.createWriteStream();
                      const op = new FlamingoOperation();
                      let error: Error;

                      op.process = profileData.process;
                      op.config = {};

                      wstream.on("finish", function () {
                        if (error) {
                          deferred.benchmark.abort();
                        }
                        deferred.resolve();
                      });
                      wstream.on("error", function (err: Error) {
                        error = err;
                        wstream.end();
                      });
                      const processorStream = suiteConfig.imageProcessors(op)(
                        rstream
                      );
                      processorStream.on("error", function (err: Error) {
                        error = err;
                        wstream.end();
                        processorStream.end();
                      });
                      processorStream.pipe(wstream);
                    });
                  });
                })
                .catch(error);
            },
          })
          .on("cycle", suiteConfig.cycle)
          .on("error", suiteConfig.error)
          .on("complete", suiteConfig.complete(suiteName, profileName, resolve))
          .run(suiteConfig.runConfig);
      });
    };

    suiteConfig.convertProfiles.forEach(function (name: string) {
      prom = prom.then(function () {
        return convertRemote(name);
      });
    });
    prom.then(() => server.stop());
    return prom;
  };
};
