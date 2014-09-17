# Flamingo - Image processing server
[![Build Status](https://travis-ci.org/piobyte/flamingo.png?branch=master)](https://travis-ci.org/piobyte/flamingo)
[![Dependency Status](https://david-dm.org/piobyte/flamingo.svg)](https://david-dm.org/piobyte/flamingo)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo.png)](https://codeclimate.com/github/piobyte/flamingo)

Flamingo is a simple, [hapi](http://hapijs.com/) based, HTTP server that allows you to convert media files to images.
Internally it uses [gm](https://github.com/aheckmann/gm) and [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) to convert image and video files.

## TODO

- `Internal Server Error` first request after starting
- /convert/{profile} refactor
- easier environment -> config mapping
- documentation
- allow profiles to modify readers/writers

## Architecture

The whole application includes different readers, preprocessors, processors and writers.
Depending on the given `input` and `output`, a chain of promises is created and executed.
The data is mostly transferred through Node.js [streams](http://nodejs.org/api/stream.html).

Reader modules don't resolve streams directly, because a given preprocessor could optimize reading of the input.
For example if a local video file is used as input the __video preprocessor__ passes the path directly to `ffmpeg` without opening and streaming the content first.

## API

Flamingo uses a REST api. You can disable specific routes using the `config.js` with the given `ROUTES.*` attributes.

- `GET` `/` - Flamingo index page <sup>ROUTES.INDEX</sup>
- `GET` `/convert/{profile}/{url}` - convert item from url using a given profile <sup>ROUTES.PROFILE_CONVERT</sup>
- `GET` `/convert/{execution}` - custom conversation <sup>ROUTES.CUSTOM_CONVERT</sup>

## Config

Modify `config.js` or set environment variables (PORT, SECRET or CIPHER).
__Note:__ if you're using the docker config, don't change the port to something other than 3000
(port 3000 is exposed from the docker image).

## Encoding payload

If you don't want others to use your flamingo instance, you encode/encrypt the api payload.
In this case __modify/update your `SECRET`__.
Modify the `DECODE_PAYLOAD` method in `config.js` to roll your own decryption (using [crypto](http://nodejs.org/api/crypto.html), see `openssl list-cipher-algorithms` for available ciphers).
The default implementation uses blowfish (`BF-CBC`) to decrypt a given base64 plaintext and converts it to utf8 (`decrypt(debase64(plain))`).
To generate an expected request you have to encrypt your initial request using `base64(blowfish(plain))`.

## Profiles

To allow small urls you can create presets in the `src/profiles` directory that contain a process queue to transform images.
Examples contain generating small squared avatar images.
Profiles use promises (via [rsvp.js](https://github.com/tildeio/rsvp.js)) to allow a more complex asynchronous behaviors
(i.e. get face position, crop to center face).

### Examples:

- resize an image to 500x500 px

```
module.exports = function () {
    return new RSVP.Promise(function (resolve) {
        resolve([{
            id: 'resize',
            width: 500,
            height: 500
        }]);
    });
};
```

## Flow (convert)

0. requests arrives on the convert route
1. `input` and `output` fields are parsed and their protocol is used to check if a reader, writer and processor for it exists.
2. `reader` promise is created and the promise chain starts
3. if a `preprocessor` exists, add the preprocessor to the promise chain
4. add a `processor`, `writer` and error handler to the promise chain

### Readers (convert)

Readers create [readable streams](http://nodejs.org/api/stream.html#stream_class_stream_readable) of an input.

- `file` - readable stream from a local file
- `data` - readable stream from [data-uri](https://en.wikipedia.org/wiki/Data_URI_scheme#Format)
- `https` - readable stream from a remote resource

__Example:__

- data input: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==`
- local file input: `file:///tmp/my/input.png`
- remote input: `https://domain.tld/image.png`

### PreProcessors (convert)

Preprocessors can process an input before it's passed to the processor.

- `video` - takes a screenshot from a video file using `ffmpeg`

### Processors (convert)

Processors processes an image input stream and uses `gm` to convert (crop, scale, rotate, flip) it.
The processors uses an array to queue multiple operations.

### Writers (convert)

A writer takes the processor output stream and writes it somewhere.

- `file` - write the stream to a local file
- `response` - write the stream in the http response

## Examples (convert)

- Rotate an base64 encoded image and store the result in a file

```
{
  "input": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
  "output": "file:///tmp/flamingo/image.png",
  "processor": {
    "type": "image",
    "queue": [{
      "id": "rotate",
      "degrees": 40
    }]
  }
}
```

- Rotate an base64 encoded image, crop and return the result

```
{
  "input": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
  "output": "response://",
  "processor": {
    "type": "image",
    "queue": [{
      "id": "rotate",
      "degrees": 40
    },{
      "id": "crop",
      "x": 10,
      "y": 10,
      "width": 100,
      "height": 100
    }]
  }
}
```
