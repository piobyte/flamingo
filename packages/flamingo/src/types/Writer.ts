import nodeStream = require("stream");

import FlamingoOperation = require("../model/flamingo-operation");

type Writer = (
  operation: FlamingoOperation
) => (stream: nodeStream.Readable) => Promise<any> | void;

export = Writer;
