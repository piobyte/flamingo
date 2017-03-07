import http = require('http');
import Promise = require('bluebird');

interface IServer extends http.Server {
  stop?: () => Promise<any>;
}

export default IServer;
