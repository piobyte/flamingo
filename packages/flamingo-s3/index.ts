/**
 * Flamingo Server instance
 * @external Server
 * @see {@link https://piobyte.github.io/flamingo/Server.html|Server}
 */

/**
 * S3 addon hooks
 * @module flamingo-s3/index
 */
import addon = require("flamingo/src/addon");
import AWS = require("aws-sdk");
import envParser = require("flamingo/src/util/env-parser");
import Server = require("flamingo/src/model/server");

/**
 * Returns s3 environment mappings
 * @return {Array} environment mappings
 * @name ENV
 * @function
 * @example
 * `AWS_ENDPOINT` => `AWS.ENDPOINT`
 * `AWS_REGION` => `AWS.REGION`
 * `AWS_SECRET` => `AWS.SECRET`
 * `AWS_ACCESS_KEY` => `AWS.ACCESS_KEY`
 * `AWS_S3_BUCKETS` => `AWS.S3.BUCKETS`
 */
exports[addon.HOOKS.ENV] = function () {
  return [
    ["AWS_ENDPOINT", "AWS.ENDPOINT"],
    ["AWS_REGION", "AWS.REGION"],
    ["AWS_SECRET", "AWS.SECRET"],
    ["AWS_ACCESS_KEY", "AWS.ACCESS_KEY"],
    ["AWS_S3_BUCKETS", "AWS.S3.BUCKETS", JSON.parse],
    ["AWS_S3_FORCE_PATH_STYLE", "AWS.S3.FORCE_PATH_STYLE", envParser.boolean],
  ];
};

/**
 * Returns default addon configuration
 * @name CONF
 * @function
 * @return {{AWS: {ENDPOINT: string, REGION: string, ACCESS_KEY: string, SECRET: string, S3: {VERSION: string, BUCKETS: {alias: {name: string, path: string}}}}}}
 */
exports[addon.HOOKS.CONF] = function () {
  return {
    AWS: {
      ENDPOINT: "",
      REGION: "eu-west-1",
      ACCESS_KEY: "0!]FHTu)sSO&ph8jNJWT",
      SECRET: "XEIHegQ@XbfWAlHI6MOVWKK7S[V#ajqZdx6N!Us%",
      S3: {
        VERSION: "2006-03-01",
        FORCE_PATH_STYLE: undefined,
        BUCKETS: {
          alias: {
            name: "bucket-id",
            path: "bucket-path/",
          },
        },
      },
    },
  };
};

/**
 * Update AWS config on start and create a AWS-S3 client (`s3Client` variable) on the server instance.
 *
 * @name START
 * @function
 * @param {Server} server server instance
 */
exports[addon.HOOKS.START] = function (server: Server) {
  const config /*: { credentials: any, region: string, apiVersion: string, endpoint?: string, s3ForcePathStyle?: boolean } */ = {
    credentials: new AWS.Credentials(
      server.config.AWS.ACCESS_KEY,
      server.config.AWS.SECRET
    ),
    region: server.config.AWS.REGION,
    apiVersion: server.config.AWS.S3.VERSION,
  };
  if (server.config.AWS.ENDPOINT !== "") {
    config["endpoint"] = server.config.AWS.ENDPOINT;
  }
  if (server.config.AWS.S3.FORCE_PATH_STYLE) {
    config["s3ForcePathStyle"] = server.config.AWS.S3.FORCE_PATH_STYLE;
  }
  AWS.config.update(config);

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  if (!server.s3Client) {
    //NOTE: s3Client is a private field and shouldn't be relied on apart from the implemented behavior.
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    server.s3Client = new AWS.S3();
  }
};
