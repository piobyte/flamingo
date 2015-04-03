# Flamingo - Image processing server
[![Build Status](https://travis-ci.org/piobyte/flamingo.png?branch=master)](https://travis-ci.org/piobyte/flamingo)
[![Dependency Status](https://david-dm.org/piobyte/flamingo.svg)](https://david-dm.org/piobyte/flamingo)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo.png)](https://codeclimate.com/github/piobyte/flamingo)
[![npm version](https://badge.fury.io/js/flamingo.svg)](https://www.npmjs.com/package/flamingo)
![MIT licensed](https://img.shields.io/badge/license-MIT-lightgrey.svg)

Flamingo is a simple, [hapi](http://hapijs.com/) based, HTTP server that allows you to convert media files to images.
Internally it uses [sharp](https://github.com/lovell/sharp), [gm](https://github.com/aheckmann/gm) and [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) to convert image and video files.

__Requires graphicsmagick >= 1.3.18 if `NATIVE_AUTO_ORIENT` is true.__

## Requirements

- node 0.12.x or io.js
- [vips](http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS)
- [graphicsmagick](http://www.graphicsmagick.org/) (if `NATIVE_AUTO_ORIENT` is true, version >= 1.3.18)
- [imagemagick](http://www.imagemagick.org/) if webp is used

## TODO

- [documentation](https://piobyte.github.io/flamingo/)
- allow profiles to modify readers/writers
- addon hook: logger
- enable flow for `src/logger`, `src/reader/https`, `src/routes/index` (complains about `require('../package.json')`: `Required module not found`)

## Architecture

The whole application includes different readers, preprocessors, processors and writers.
The data is mostly transferred through Node.js [streams](http://nodejs.org/api/stream.html).

Reader modules don't resolve streams directly, because a given preprocessor could optimize reading of the input.

## API

Flamingo uses a REST api. You can disable specific routes using the `config.js` with the given `ROUTES.*` attributes.

- `GET` `/` - Flamingo index page <sup>ROUTES.INDEX</sup>
- `GET` `/convert/{profile}/{url}` - convert item from url using a given profile <sup>ROUTES.PROFILE_CONVERT</sup>

## Config

Modify `config.js` or set environment variables.
See [docs/config](https://piobyte.github.io/flamingo/module-flamingo_config-CONFIG.html) for more information for each configuration variable.
__Note:__ if you're using the docker config, don't change the port to something other than 3000
(port 3000 is exposed from the docker image).

__environment variables -> config mappings__

- `PORT` -> `PORT`
- `NATIVE_AUTO_ORIENT` -> `NATIVE_AUTO_ORIENT`
- `ROUTE_PROFILE_CONVERT` -> `ROUTES.PROFILE_CONVERT`
- `ROUTE_INDEX` -> `ROUTES.ROUTE_INDEX`
- `CRYPTO_IV` -> `CRYPTO.IV`
- `CRYPTO_KEY` -> `CRYPTO.KEY`
- `CRYPTO_CIPHER` -> `CRYPTO.CIPHER`
- `READER_REQUEST_TIMEOUT` -> `READER.REQUEST.TIMEOUT`

- `SENTRY_DSN` -> `SENTRY_DSN`
- `MEMWATCH` -> `MEMWATCH`

### CRYPTO

__change these values if you want to use this server in a production environment__

- `IV` - decipher [IV](https://en.wikipedia.org/wiki/Initialization_vector)
- `KEY` - `base64` - decipher key
- `CIPHER` - cipher algorithm

## Encoding payload

If you don't want others to use your flamingo instance, you encode/encrypt the api payload.
In this case __modify/update your `SECRET`__.
Modify the `DECODE_PAYLOAD` method in `config.js` to roll your own decryption (using [crypto](http://nodejs.org/api/crypto.html), see `openssl list-cipher-algorithms` for available ciphers).
The default implementation uses blowfish (`BF-CBC`) to decrypt a given base64 plaintext and converts it to utf8 (`decrypt(debase64(plain))`).
To generate an expected request you have to encrypt your initial request using `base64(blowfish(plain))`.

## Profiles

To allow short urls, you can create presets in the `src/profiles/` directory.
Profiles use promises (via [rsvp.js](https://github.com/tildeio/rsvp.js)) to allow more complex asynchronous behaviors
(i.e. get face position, crop to center face).

Each profile promise must resolve an object containing various fields:

- `response` {Object}
    - `header` {Object}
        - `key: value` - calls [reply](http://hapijs.com/api#replyerr-result)`.header(key, value)` to use custom response header fields
- `process` {Array} array of processor commands

### Example

- convert to `jpg`
- resize an image to 200x200 pixel
- set background color to `white`
- set response header `Content-Type` to `image/jpeg`
- available on `/convert/my-profile/{cipher}`

```
module.exports = {
    'my-profile': function (RSVP, query) {
        return new RSVP.Promise(function (resolve) {
            resolve({ response: { header: { 'Content-Type': 'image/jpeg' }},
                process: [{
                    processor: 'sharp', pipe: function (pipe) {
                        return pipe.resize(200, 200).background('white').flatten().toFormat('jpeg');
                    }
                }]
            });
        });
    }
};
```

## Addons

Flamingo addons only interact with the base flamingo installation using specified hooks, ie.: `"ENV", "CONF", "PROFILES", "ROUTES", "HAPI_PLUGINS"`.
For detailed information on available hooks and some examples, look at the [addon documentation](https://piobyte.github.io/flamingo/module-flamingo_src_addon.HOOKS.html).

###Installation

Use npm to install flamingo addons. Example: `npm install flamingo-s3` (Example addon available at [https://github.com/piobyte/flaminfo-s3]).
Modify the addon config by overwriting fields inside your `config.js`. The config loading order is as follows:

1. load addon config
2. merge addon config with flamingo config (flamingo `config.js` fields will overwrite addon fields)
3. overwrite config fields with environment variables

###Discovery

Flamingo will detect package dependencies (and development dependencies [`devDependencies`]) that contain the `"flamingo-addon"` keyword.
Using the specified entry point it'll load the addon.
