var fs = require('fs'),
  http = require('http');

// TODO: async / promise
function startImageServer(host, port, filePath) {
  // TODO: maybe launch in another process
  var httpServer = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    fs.createReadStream(filePath).pipe(res, {end: true});
  });
  httpServer.timeout = 4 * 1000; // 4 sec
  httpServer.listen(port, host);
  return httpServer;
}

module.exports = startImageServer;
