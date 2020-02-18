/**
 * Flamingo file writer
 * @module
 */
import fs = require("fs");
import mkdirp = require("mkdirp");
import path = require("path");
import stream = require("stream");
import fileAccessAllowed = require("../util/file-access-allowed");
import FlamingoOperation = require("../model/flamingo-operation");
import errors = require("../util/errors");

const { InvalidInputError } = errors;

/**
 * Creates a function that calls the given reply function with a stream
 * @return {Function} function that writes a stream to a given file
 */
export = function({ input, reply, config }: FlamingoOperation) {
  return function(stream: stream.Writable) {
    const outputPath = path.normalize(input.path);
    const outputDir = path.dirname(outputPath);
    const allowed = fileAccessAllowed(
      path.normalize(outputPath),
      config.ACCESS!.FILE!.WRITE
    );

    if (!allowed) {
      return Promise.reject(
        new InvalidInputError("File access not allowed", outputPath)
      );
    }

    return new Promise(function(resolve, reject) {
      mkdirp(outputDir, function(err) {
        if (err) {
          reject(err);
        } else {
          stream.on("error", reject);
          const writeStream = stream.pipe(fs.createWriteStream(outputPath), {
            end: true
          });
          writeStream.on("error", reject);
          writeStream.on("finish", function() {
            resolve(
              reply
                .response({
                  statusCode: 200,
                  message: outputPath + " created"
                })
                .code(200)
            );
          });
        }
      });
    });
  };
};
