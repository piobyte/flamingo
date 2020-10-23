import noop = require("lodash/noop");
import Hapi = require("@hapi/hapi");

import Config = require("../../config");
import Reader = require("../types/Reader");
import Writer = require("../types/Writer");
import { ProcessInstruction } from "../types/Instruction";

/**
 * Base operation class that is intented to be created for each request and holds request metadata.
 * @class
 * @property {Request} request
 * @property {function} profile
 * @property {function} reply
 * @property {function} reader
 * @property {function} writer
 * @property {*} input
 */
class FlamingoOperation {
  request: any = {};
  reply: Hapi.ResponseToolkit = (noop as any) as Hapi.ResponseToolkit;
  preprocessorConfig: any = {
    seekPercent: 0.1,
  };
  reader: Reader = () => Promise.reject("operation reader isn't implemented");
  writer: Writer = () => () =>
    Promise.reject("operation writer isn't implemented");
  input: any = undefined;
  process: Array<ProcessInstruction<any>> = [];
  response?: { header?: Record<string, string> };
  config: Config = {};
}

/**
 * global profiles object
 * @static
 * @property {{}} profiles
 */
export = FlamingoOperation;
