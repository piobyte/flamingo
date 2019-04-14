import noop = require('lodash/noop');

import Config = require('../../config');
import Reader = require('../types/Reader');
import Writer = require('../types/Writer');
import { ProcessInstruction } from '../types/Instruction';
import { Reply, Request } from '../types/HTTP';

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
  request: Request;
  reply: Reply;
  preprocessorConfig: any = {
    seekPercent: 0.1
  };
  reader: Reader = noop;
  writer: Writer = () => noop;
  input: any = undefined;
  process: Array<ProcessInstruction<any>> = [];
  response: any = {};

  config: Config;

  [field: string]: any;
}

/**
 * global profiles object
 * @static
 * @property {{}} profiles
 */
export = FlamingoOperation;
