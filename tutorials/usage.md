## Booting the server

### Standalone

- clone the flamingo repo
- run `node index.js` (If you want to change the default config)

  To change default config, you can use environment parameters. 
  See [Config](https://github.com/piobyte/flamingo/blob/master/config.js) for available environment mappings.
  
  __Note:__ if you got suggestions on other environment parameter initialization methods, i.e. config files, open an issue.

- Image conversation `/image/{profile}/{url}` - convert an image at `url` location using the `profile` profile 
(disabled in standalone setup by setting `ROUTES.PROFILE_CONVERT_IMAGE` to false)
- Video conversation `/video/{profile}/{url}` - convert an video at `url` location using the `profile` profile
(disabled in standalone setup by setting `ROUTES.PROFILE_CONVERT_VIDEO` to false)
- Index `/` - displays some metadata about flamingo (If `DEBUG` is true, there's a whole lot more metadata visible)
(disabled in standalone setup by setting `ROUTES.INDEX` to false)

The `{url}` needs to be base64 encoded. See [#crypto](#crypto) for more information on how to encrypt the source url.

### CRYPTO

By default the `/*/{profile}/{url}` route accepts an encrypted url.
If you don't want to encrypt the url beforehand, you can disable crypto with the [`CRYPTO.ENABLED`](https://piobyte.github.io/flamingo/Config.html) variable.

__Change these values if you want to use this server in a production environment__

- `IV` - cipher [IV](https://en.wikipedia.org/wiki/Initialization_vector)
- `KEY` - `base64` - cipher key
- `CIPHER` - cipher algorithm (default `BF-CBC`)

## Encoding payload

Modify the `DECODE_PAYLOAD` method in `config.js` to roll your own decryption (using [crypto](https://nodejs.org/api/crypto.html), see `openssl list-cipher-algorithms` for available ciphers).
The default implementation uses blowfish (`BF-CBC`) to decrypt a given base64 plaintext and converts it to utf8 (`decrypt(debase64(plain))`).
To generate an expected request you have to encrypt your initial request using `base64(blowfish(plain))`.

### As a library

- `npm i -s flamingo`
- this is the preferred method if you want to customize flamingo
- the standalone flamingo setup is already using flamingo as a library ([source](https://github.com/piobyte/flamingo/blob/master/index.js))

#### custom routes

- the server instances `withRoutes` method allows you to pass all routes that should be available to flamingo
  - don't want the index route? don't push it into the array
  - want a flamingo addon route? load the module and push it into the array (see code below) 
- see {@tutorial hmac-image-convert} or {@tutorial markdown-to-image} for example library setups

```js
// my-flamingo.js
const Server = require('flamingo/src/model/server');
const Config = require('flamingo/config');
const AddonLoader = require('flamingo/src/addon/loader');
const profiles = require('flamingo/src/profiles/examples');
const S3Route = require('flamingo-s3/src/route');

Config.fromEnv().then(config => {
  return new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([profiles])
    .withRoutes([new S3Route(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
```
