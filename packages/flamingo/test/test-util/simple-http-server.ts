import http = require("http");

import IServer from "./IServer";

export = function simpleHttpServer(
  callback,
  port = 0,
  host = "localhost"
): Promise<IServer> {
  const httpServer = http.createServer((req, res) => {
    callback(req, res);
  });
  httpServer.timeout = 4 * 1000;
  httpServer.listen(port, host);

  return new Promise<IServer>(resolve => {
    (httpServer as IServer).stop = () =>
      new Promise((resolve, reject) => {
        httpServer.close(function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    httpServer.listen(port, host, () => {
      resolve(httpServer as IServer);
    });
  });
};
