"use strict";
const type = "s3";
/**
 * S3 reader module
 * @module flamingo-s3/src/reader
 */
/**
 * Result of input reading
 * @typedef {{stream: function, type: string}} ReadResult
 * @property {string} type reader result type
 * @property {function} stream function that returns a readable image stream
 */
/**
 * Reader that creates a stream for a given http/https resource
 * @param {string} bucket bucket name
 * @param {string} key bucket key
 * @param {AWS} s3Client AWS s3 client
 * @return {Promise.<ReadResult>} promise that resolves a reader result
 */
function s3Reader(bucket, key, s3Client) {
    const params = {
        Bucket: bucket,
        Key: key
    };
    return s3Client
        .headObject(params)
        .promise()
        .then(() => ({
        stream: () => s3Client.getObject(params).createReadStream(),
        type
    }));
}
module.exports = s3Reader;
