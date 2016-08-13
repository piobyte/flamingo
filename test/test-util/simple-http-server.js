const http = require('http');
const Promise = require('bluebird');

module.exports = function simpleHttpServer(callback, port = undefined, host = undefined) {
  const httpServer = http.createServer(function (req, res) {
    callback(req, res);
  });
  httpServer.timeout = 4 * 1000;
  if (port || host) {
    httpServer.listen(port, host);
  } else {
    httpServer.listen(0);
  }

  httpServer.stop = Promise.promisify(httpServer.close, {context: httpServer});
  return httpServer;
};
