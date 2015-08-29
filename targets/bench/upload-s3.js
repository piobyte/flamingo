/* eslint no-console: 0 */
var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.BENCH_S3_ACCESS_KEY,
  secretAccessKey: process.env.BENCH_S3_SECRET_ACCESS_KEY,
  region: 'eu-central-1'
});

var S3_VERSION = '2006-03-01',
  BUCKETNAME = 'flamingo-bench',
  s3 = new AWS.S3(S3_VERSION);

module.exports = function (fileName, buffer) {
  s3.putObject({Bucket: BUCKETNAME, Key: fileName, Body: buffer}, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('uploaded ' + fileName + ' to s3 bucket:' + BUCKETNAME);
    }
  });
};
