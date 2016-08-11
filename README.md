# Flamingo - Image processing server

<div style="text-align:center">
  <img style="width: 200px;image-rendering: -moz-crisp-edges;image-rendering: -o-crisp-edges;image-rendering: -webkit-optimize-contrast;-ms-interpolation-mode: nearest-neighbor;image-rendering: pixelated;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jbWRMQqDQBBFnyGVSJpUkj72e4/UphUP4FlyAEkteIecIPZeQAlYiW67qTagzKIo+eWy78+fP/Av9Ulm+iQzS/88F9zqAYDQDzg9H+I/gIP0+O4+REXuNXrEGm1SHaeLK+yGxRXqODWNHoHlMsVy6jg1oR8ATDqQChUTWHAOt3pgnkY0iIp8MsXCm1QqZUqltl/Dwi6Towt83e4/oARzvlyhqtZPtga74s+TSHKecQ0M8AXIOlSRGTKPKQAAAABJRU5ErkJggg==" alt="">
</div>

[![Issues](https://img.shields.io/github/issues/piobyte/flamingo.svg)](https://github.com/piobyte/flamingo/issues)
[![Build Status](https://travis-ci.org/piobyte/flamingo.png?branch=master)](https://travis-ci.org/piobyte/flamingo)
[![Dependency Status](https://david-dm.org/piobyte/flamingo.svg)](https://david-dm.org/piobyte/flamingo)
[![Code Climate](https://codeclimate.com/github/piobyte/flamingo.png)](https://codeclimate.com/github/piobyte/flamingo)
[![documentation](https://inch-ci.org/github/piobyte/flamingo.svg?branch=master)](https://inch-ci.org/github/piobyte/flamingo)
[![npm version](https://badge.fury.io/js/flamingo.svg)](https://www.npmjs.com/package/flamingo)
![MIT licensed](https://img.shields.io/github/license/piobyte/flamingo.svg)

Flamingo is a simple, [hapi](http://hapijs.com/) based, HTTP server that allows you to convert media files to images.
Internally it uses [sharp](https://github.com/lovell/sharp), [gm](https://github.com/aheckmann/gm) and [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) to convert image and video files.

## Documentation

Flamingo uses jsdoc [docs and tutorials](https://piobyte.github.io/flamingo/) for detailed usage information.

## Requirements

- minimum node `6`
- [vips](http://www.vips.ecs.soton.ac.uk/index.php?title=VIPS)
- [graphicsmagick](http://www.graphicsmagick.org/) (for webp support compile from source. See `tools/install-graphicsmagick.sh`)
- [imagemagick](https://www.imagemagick.org/)

## Architecture

The whole application includes different readers, preprocessors, processors and writers.
The data is mostly transferred through Node.js [streams](https://nodejs.org/api/stream.html).
Reader modules don't resolve streams directly, because a given preprocessor could optimize reading of the input 
(i.e. pass filepath or url to ffmpeg instead of streaming the whole file first).

## Useful bunyan filters

- only log memwatch stats or leaks `bunyan -c 'this.msg === "stats" || this.msg === "leak"'`
