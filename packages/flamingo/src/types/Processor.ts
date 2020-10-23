import FlamingoOperation = require("../model/flamingo-operation");
import stream = require("stream");

export interface Processor<T> {
  (
    operation: FlamingoOperation,
    pipeline: (impl: T) => T,
    stream: stream.Readable
  ): stream.Readable;
}
