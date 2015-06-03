# Flamingo - Image processing server
[![Build Status](https://travis-ci.org/piobyte/flamingo.png?branch=master)](https://travis-ci.org/piobyte/flamingo)
[![Dependency Status](https://david-dm.org/piobyte/flamingo.svg)](https://david-dm.org/piobyte/flamingo)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo.png)](https://codeclimate.com/github/piobyte/flamingo)
[![npm version](https://badge.fury.io/js/flamingo.svg)](https://www.npmjs.com/package/flamingo)
![MIT licensed](https://img.shields.io/github/license/piobyte/flamingo.svg)

Flamingo is a simple, [hapi](http://hapijs.com/) based, HTTP server that allows you to convert media files to images.
Internally it uses [sharp](https://github.com/lovell/sharp), [gm](https://github.com/aheckmann/gm) and [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) to convert image and video files.

## Requirements

- node 0.12.x or io.js
- [vips](http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS)
- [graphicsmagick](http://www.graphicsmagick.org/) (if `NATIVE_AUTO_ORIENT` is true, version >= 1.3.18)
- [imagemagick](http://www.imagemagick.org/) if webp is used

## 1.0.0 TODO

- [documentation](https://piobyte.github.io/flamingo/)
- ~~enable flow for `src/logger`, `src/reader/https`, `src/routes/index` (complains about `require('../package.json')`: `Required module not found`)~~ can be added when [flow#167](https://github.com/facebook/flow/issues/167) is ready

## Architecture

The whole application includes different readers, preprocessors, processors and writers.
The data is mostly transferred through Node.js [streams](http://nodejs.org/api/stream.html).
Reader modules don't resolve streams directly, because a given preprocessor could optimize reading of the input (i.e. pass filepath to ffmpeg instead of streaming the whole file first).

## API

Flamingo uses a HTTP based api. You can disable specific routes using the `config.js` with the given `ROUTES.*` attributes.
Flamingo provides some simple routes that allow you to convert images and videos to images.

- `GET` `/` - Flamingo index page which contains project metadata (version, issue tracker)<sup>ROUTES.INDEX</sup>
- `GET` `/convert/image/{profile}/{url}` - convert image from url using a given profile <sup>ROUTES.PROFILE_CONVERT_IMAGE</sup>
- `GET` `/convert/video/{profile}/{url}` - convert video from url using a given profile <sup>ROUTES.PROFILE_CONVERT_VIDEO</sup> (Note: the video handler isn't used in production, so we can't say anything on how reliable it is)

The `{url}` needs to be base64 encoded. See [#crypto](#crypto) for more information on how to encrypt the source url.

## Config

Modify `config.js` or set environment variables. See [CONFIG](https://piobyte.github.io/flamingo/module-flamingo_config-CONFIG.html) for fields and their description.

__Note:__ if you're using the `Dockerfile`, don't change the port to anything other than 3000 (port 3000 is exposed from the container).

To allow configuration without modifying the config file, there are some environment variable mappings.
If they're set, the default config will be overwritten.
If an environment mapping exists, it's documented under the `Environment` keyword. (i.e. `Environment: 'DEBUG'`)

### CRYPTO

By default the `/convert/*/{profile}/{url}` route accepts an encrypted url.
If you don't want to encrypt the url beforehand, you can disable crypto with the [`CRYPTO.ENABLED`](https://piobyte.github.io/flamingo/module-flamingo_config-CONFIG.html#.CRYPTO) variable.

__Change these values if you want to use this server in a production environment__

- `IV` - decipher [IV](https://en.wikipedia.org/wiki/Initialization_vector)
- `KEY` - `base64` - decipher key
- `CIPHER` - cipher algorithm (default `BF-CBC`)

## Encoding payload

Modify the `DECODE_PAYLOAD` method in `config.js` to roll your own decryption (using [crypto](http://nodejs.org/api/crypto.html), see `openssl list-cipher-algorithms` for available ciphers).
The default implementation uses blowfish (`BF-CBC`) to decrypt a given base64 plaintext and converts it to utf8 (`decrypt(debase64(plain))`).
To generate an expected request you have to encrypt your initial request using `base64(blowfish(plain))`.

## Profiles

Flamingo is based on profiles that represent presets for media transformations.
See `src/profiles/` the directory for example implementations.

Each profile function must resolve an object containing various fields:

- `response` {Object}
    - `header` {Object}
        - `key: value` - calls [reply](http://hapijs.com/api#replyerr-result)`.header(key, value)` to use custom response header fields
- `process` {Array} array of processor commands

__Example__

- use [sharp](https://github.com/lovell/sharp)
- convert to `jpg`
- resize an image to 200x200 pixel
- set background color to `white`
- set response header `Content-Type` to `image/jpeg`
- available on `/convert/image/my-profile/{cipher}`

```
// src/profiles/examples.js
module.exports = {
    'my-profile': function (request, query) {
        return Promise.resolve({ response: { header: { 'Content-Type': 'image/jpeg' }},
            process: [{
                processor: 'sharp', pipe: function (pipe) {
                    return pipe.resize(200, 200).background('white').flatten().toFormat('jpeg');
                }
            }]
        });
    }
};
```

## Addons

Flamingo addons only interact with the base flamingo installation using specific hooks, ie.: `"ENV", "CONF", "PROFILES", "ROUTES", "HAPI_PLUGINS"`.
For detailed information on available hooks and some examples, look at the [addon documentatierron](https://piobyte.github.io/flamingo/module-flamingo_src_addon.HOOKS.html).

__"official" addons__

- [flamingo-s3](https://github.com/piobyte/flamingo-s3): enable aws s3 integration
- [flamingo-sentry](https://github.com/piobyte/flamingo-sentry): enable sentry error logging

###Installation

Use npm to install flamingo addons. Example: `npm install flamingo-s3 --save`.
Modify the addon config by overwriting fields inside your `config.js`.

The config loading order is as follows:

1. load addon config
2. merge addon config with flamingo config (flamingo `config.js` fields will overwrite addon fields)
3. overwrite config fields with environment variables

###Discovery

Flamingo will detect package dependencies (and development dependencies [`devDependencies`]) that contain the `"flamingo-addon"` keyword.
Using the specified entry point it'll load the addon and use its hooks.
