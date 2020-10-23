"use strict";

import Errors = require("flamingo/src/util/errors");
import Route = require("flamingo/src/model/route");
import FlamingoOperation = require("flamingo/src/model/flamingo-operation");
import Server = require("flamingo/src/model/server");
import Config = require("flamingo/config");

import s3Reader = require("./reader");
import Constructor from "flamingo/src/model/Constructor";
import { S3Input } from "flamingo-s3/src/types";

const { InvalidInputError } = Errors;

const KEY_DELIMITER = "-";

export = function S3Mixin<T extends Constructor<Route>>(SuperClass: T) {
  /**
   * Mixin that adds a video preprocessor which creates an image from a given video
   * @mixin
   */
  class S3 extends SuperClass {
    /**
     * Extracts bucket name and key for a given operation
     * @param {FlamingoOperation} operation
     * @return {Promise.<{bucket: string, key: string}>}
     */
    extractInput(operation: FlamingoOperation): Promise<S3Input> {
      const bucketAlias = operation.request.params.bucketAlias;
      const bucket = operation.config.AWS.S3.BUCKETS[bucketAlias];
      const keySplit = operation.request.params.key.split(KEY_DELIMITER);
      const key = keySplit.slice(-2).join("/");

      if (!bucket) {
        return Promise.reject(
          new InvalidInputError(`Tried to use unknown bucket (${bucketAlias})`)
        );
      }
      if (keySplit.length < 2) {
        return Promise.reject(
          new InvalidInputError(
            `Invalid key string format (${keySplit.join(KEY_DELIMITER)})`
          )
        );
      }

      return Promise.resolve({ bucket, key });
    }

    /**
     * Creates a s3 reader for the given bucket and key
     * @param {string} bucket
     * @param {string} key
     * @return {Promise.<function(): Promise.<ReadResult>>}
     */
    extractReader({ bucket, key }: S3Input) {
      return Promise.resolve(() =>
        s3Reader(
          bucket.name,
          `${bucket.path}${key}`,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.server.s3Client
        )
      );
    }
  }

  return S3;
};
