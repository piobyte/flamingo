- `npm i -s flamingo`
- `npm i -s flamingo-s3`

## Booting a server with s3 route 

- uses regular flamingo start sequence with the route provided by flamingo-s3

```js
// my-flamingo.js
const Server = require('flamingo/src/model/server');
const Config = require('flamingo/config');
const AddonLoader = require('flamingo/src/addon/loader');
const profiles = require('flamingo/src/profiles/examples');
const S3Route = require('flamingo-s3/src/route');

const pkg = require('./package.json');

Config.fromEnv().then(config => {
  return new Server(config, new AddonLoader(__dirname, pkg).load())
    .withProfiles([profiles])
    .withRoutes([new S3Route(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
```

## Bucket configuration

- `AWS.SECRET` = AWS secret
- `AWS.REGION` = AWS region
- `AWS.S3.VERSION` = AWS S3 client version
- `AWS.S3.BUCKETS` = mapping for url params to s3 bucket path:
 - key delimiter: `-`
 - using the following configuration, `s3/cats/avatar-image/fixtures-fixture.jpg` maps to s3 path `cats/fixtures/fixture.jpg`

```
    AWS: {
        REGION: 'eu-west-1',
        ACCESS_KEY: '0!]FHTu)sSO&ph8jNJWT',
        SECRET: 'XEIHegQ@XbfWAlHI6MOVWKK7S[V#ajqZdx6N!Us%',
        S3: {
            VERSION: '2006-03-01',
            BUCKETS: {
              cats: {
                name: bucketName,
                path: 'cats/'
              }
            }
        }
    }
```

## Configuring via environment variables

See {@link module:flamingo-s3/index|ENV} for all existing environment mappings.

To start with custom environment variables, run i.e. 
```sh
AWS_REGION="eu-central-1" AWS_SECRET="XEIHegQ@XbfWAlHI6MOVWKK7S[V#ajqZdx6N!Us%" AWS_ACCESS_KEY="0!]FHTu)sSO&ph8jNJWT" AWS_S3_BUCKETS={"pets":{"name":"my-pets","path":"my_pets/"}} node my-flamingo.js
```
