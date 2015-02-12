var config = require('../../config'),
    RSVP = require('rsvp'),
    readerType = require('./reader-type'),
    AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: config.AWS.ACCESS_KEY,
    secretAccessKey: config.AWS.SECRET,
    region: config.AWS.REGION
});

var s3 = new AWS.S3(config.AWS.S3.VERSION);

module.exports = function (bucket, key) {
    return new RSVP.Promise(function (resolve, reject) {
        var params = {
            Bucket: bucket,
            Key: key
        };
        s3.headObject(params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    stream: function () {
                        return s3.getObject(params).createReadStream();
                    },
                    type: readerType.S3
                });
            }
        });
    });
};
