const http = require('http');
const Promise = require('bluebird');

module.exports = function simpleHttpServer(callback, port = 0, host = 'localhost') {
  const httpServer = http.createServer(function (req, res) {
    callback(req, res);
  });
  httpServer.timeout = 4 * 1000;
  httpServer.listen(port, host);

  return new Promise(resolve => {
    httpServer.stop = Promise.promisify(httpServer.close, {context: httpServer});
    httpServer.listen(port, host, function(){
      resolve(httpServer);
    });
  });
};
