const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const Promise = require('bluebird');
const {InvalidInputError} = require('../src/util/errors');
const AWS = require('aws-sdk');

const KEY_DELIMITER = '-';
const type = 's3';

AWS.config.update({
  accessKeyId: '123',
  secretAccessKey: 'abc'
});
AWS.config.setPromisesDependency(Promise);

function s3Reader(bucket, key, s3Client) {
  const params = {
    Bucket: bucket,
    Key: key
  };
  return s3Client.headObject(params).promise()
    .then(() => ({
      stream: () => s3Client.getObject(params).createReadStream(),
      type
    }));
}

class S3Route extends Image {
  constructor(conf, method = 'GET', path = '/s3/{bucketAlias}/{profile}/{key}', description = 'Profile conversion based on aws s3 input') {
    super(conf, method, path, description);
    this.s3 = new AWS.S3(conf.AWS.S3.VERSION);
  }

  extractInput(operation) {
    const bucketAlias = operation.request.params.bucketAlias;
    const bucket = operation.config.AWS.S3.BUCKETS[bucketAlias];
    const keySplit = operation.request.params.key.split(KEY_DELIMITER);
    const key = keySplit.slice(-2).join('/');

    if (!bucket) {
      return Promise.reject(new InvalidInputError(`Tried to use unknown bucket (${bucketAlias})`));
    }
    if (keySplit.length < 2) {
      return Promise.reject(new InvalidInputError(`Invalid key string format (${keySplit.join(KEY_DELIMITER)})`));
    }

    return Promise.resolve({bucket, key});
  }

  extractReader({bucket, key}) {
    return Promise.resolve(() => s3Reader(bucket.name, `${bucket.path}${key}`, this.s3));
  }
}

Config.fromEnv().then(config => {
  config.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);

  config.AWS = {
    REGION: 'eu-west-1',
    ACCESS_KEY: '0!]FHTu)sSO&ph8jNJWT',
    SECRET: 'XEIHegQ@XbfWAlHI6MOVWKK7S[V#ajqZdx6N!Us%',
    S3: {
      VERSION: '2006-03-01',
      BUCKETS: {
        cats: {
          name: 'secret-cats-bucket-name',
          path: 'cats/'
        }
      }
    }
  };

  new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new S3Route(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
