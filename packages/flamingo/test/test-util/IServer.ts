import http = require("http");
import * as Net from "net";

interface IServer extends http.Server {
  stop: () => Promise<any>;
  address: () => Net.AddressInfo;
}

export default IServer;
