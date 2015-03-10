# Flamingo - Image processing server
[![Build Status](https://travis-ci.org/piobyte/flamingo.png?branch=master)](https://travis-ci.org/piobyte/flamingo)
[![Dependency Status](https://david-dm.org/piobyte/flamingo.svg)](https://david-dm.org/piobyte/flamingo)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo.png)](https://codeclimate.com/github/piobyte/flamingo)
![npm version](https://badge.fury.io/js/flamingo.svg)

Flamingo is a simple, [hapi](http://hapijs.com/) based, HTTP server that allows you to convert media files to images.
Internally it uses [gm](https://github.com/aheckmann/gm) and [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) to convert image and video files.

__Requires graphicsmagick >= 1.3.18 if `NATIVE_AUTO_ORIENT` is true.__

## TODO

- /convert/{profile} refactor
- documentation
- allow profiles to modify readers/writers
- addon hook: logger

## Architecture

The whole application includes different readers, preprocessors, processors and writers.
The data is mostly transferred through Node.js [streams](http://nodejs.org/api/stream.html).

Reader modules don't resolve streams directly, because a given preprocessor could optimize reading of the input.

## API

Flamingo uses a REST api. You can disable specific routes using the `config.js` with the given `ROUTES.*` attributes.

- `GET` `/` - Flamingo index page <sup>ROUTES.INDEX</sup>
- `GET` `/convert/{profile}/{url}` - convert item from url using a given profile <sup>ROUTES.PROFILE_CONVERT</sup>
- `GET` `/convert/{execution}` - custom conversation <sup>ROUTES.CUSTOM_CONVERT</sup>

## Config

Modify `config.js` or set environment variables.
__Note:__ if you're using the docker config, don't change the port to something other than 3000
(port 3000 is exposed from the docker image).

__environment variables -> config mappings__

- `PORT` -> `PORT`
- `NATIVE_AUTO_ORIENT` -> `NATIVE_AUTO_ORIENT`
- `ROUTE_CUSTOM_CONVERT` -> `ROUTES.CUSTOM_CONVERT`
- `ROUTE_PROFILE_CONVERT` -> `ROUTES.PROFILE_CONVERT`
- `ROUTE_INDEX` -> `ROUTES.ROUTE_INDEX`
- `CRYPTO_IV` -> `CRYPTO.IV`
- `CRYPTO_KEY` -> `CRYPTO.KEY`
- `CRYPTO_CIPHER` -> `CRYPTO.CIPHER`
- `PROFILES_DIR` -> `PROFILES_DIR`
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

If you want to use more than the default profiles (`src/profiles`), set a path to another directory using `conf.PROFILES_DIR` or `ENV.PROFILES_DIR`.
This will load all files in the defined directory and add them to the default profiles.

### External profile files/directory rules

- An external profile file (not located in `src/profiles`) __can\`t__ use `require('module')` to load project dependencies.
- A profiles file should only contain one `module.exports` that exports an object containing profile name (key) and profile generation function (value).
- The profile generation function should return a promise that resolves an object containing an array of operations (`process` object property) that can be used in the processor.
As of now, the profile function is invoked with the `RSVP` object (to create a promise) and the request query object by default.

Besides the `process` field there is support for more customization:

- `response` {Object}
    - `header` {Object}
        - `key: value` - calls [reply](http://hapijs.com/api#replyerr-result)`.header(key, value)` to use custom response header fields
- `process` {Array} array of processor commands

### Example

- convert to `jpg`
- resize an image to 200x200 pixel by [treating width and height as minimum values](http://www.graphicsmagick.org/GraphicsMagick.html#details-geometry)
- result is an squared image that is fully filled with the source image without containing whitespace
- set response header `Content-Type` to `image/jpg`
- available on `/convert/my-profile/{cipher}`

```
module.exports = {
    'my-profile': function (RSVP, query) {
        return new RSVP.Promise(function (resolve) {
            resolve({ response: { header: {
                    'Content-Type': 'image/jpg'
                }},
                process: [
                    { id: 'format', format: 'jpg' },
                    { id: 'resize', width: 200, height: '200^'},
                    { id: 'extent', width: 200, height: 200 }
                ]
            });
        });
    }
};
```

## Addons

###Installation

Use npm to install flamingo addons. Example: `npm install flamingo-s3`.
Modify the addon config by overwriting fields inside your `config.js`. The config loading order is as follows:

1. load addon config
2. merge addon config with flamingo config (flamingo `config.js` fields will overwrite addon fields)
3. overwrite config fields with environment variables

###Discovery

Flamingo will detect package dependencies (and development dependencies [`devDependencies`]) that contain the `"flamingo-addon"` keyword.
Using the specified entry point it'll load the addon.

###Development - Hooks

Flamingo addons only interact with the base flamingo installation using specified hooks, ie.: `"ENV", "CONF", "PROFILES", "ROUTES", "HAPI_PLUGINS"`.
Each hook inside an addon must return a function that returns an expected value. To make it easier to change hook names,
use the exported `HOOKS` from the `src/addon.js` module (ie. `addon.HOOK.CONF`).

__ENV__ hook:

The `"ENV"` hook allows you to extend environment variable parsing.
It must export a function that returns an array of configurations compatible with the `src/util/env-config.js` module.
See the `env-config` module documentation for more information.

__CONF__ hook:

The `"CONF"` hook allows you to set default parameter for your addon.
It will merge the config object with the flamingo config (`config.js`).
It must export a function that returns an object.

__PROFILES__ hook:

The `"PROFILES"` hook allows you to register additional profiles that are available inside the profile conversion route (`src/routes/profile.js`).
It must export a function that returns an object.

__ROUTES__ hook:

The `"ROUTES"` hook allows you to register additional [hapi routes](http://hapijs.com/tutorials/routing#routes).
It must export a function that returns an array of route registration objects

__HAPI_PLUGINS__ hook:

The `"HAPI_PLUGINS"` hook allows you to register additional [hapi plugins](http://hapijs.com/tutorials/plugins#loading-a-plugin).
It must export a function that returns an array of plugin registrations.
