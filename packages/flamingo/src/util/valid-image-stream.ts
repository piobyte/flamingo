import FileType = require("file-type");
import peek = require("buffer-peek-stream");
import isStream = require("is-stream");
import errors = require("./errors");
import FlamingoOperation = require("../model/flamingo-operation");
import { Readable as ReadableStream } from "stream";

const { ProcessingError, InvalidInputError } = errors;

export = function(_operation?: FlamingoOperation) {
  return async function(stream: ReadableStream): Promise<ReadableStream> {
    if (!isStream(stream)) throw new ProcessingError("Not a stream");

    return new Promise((resolve, reject) => {
      peek(stream, 256, async (err, data, outputStream) => {
        const file = await FileType.fromBuffer(data);

        if (file?.mime.split("/")[0] === "image") {
          resolve(outputStream);
        } else {
          reject(new InvalidInputError("Not an image stream"));
        }
      });
    });
  };
};
