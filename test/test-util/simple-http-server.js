var http = require('http');
const Promise = require('bluebird');

module.exports = function simpleHttpServer(host, port, callback) {
  var httpServer = http.createServer(function (req, res) {
    callback(req, res);
  });
  httpServer.timeout = 4 * 1000;
  httpServer.listen(port, host);

  httpServer.stop = Promise.promisify(httpServer.close, {context: httpServer});
  return httpServer;
};
