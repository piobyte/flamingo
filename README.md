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

Flamingo provides a [server](https://piobyte.github.io/flamingo/Server.html) and [route](https://piobyte.github.io/flamingo/Route.html) class.
In addition to that, there are a couple mixins that make it easy to add image conversion to routes.
The default [image conversion route](https://piobyte.github.io/flamingo/Image.html) is a route created by mixing [ImageStream](https://piobyte.github.io/flamingo/ImageStream.html), 
[ProfileOperation](https://piobyte.github.io/flamingo/ProfileOperation.html) and [Convert](https://piobyte.github.io/flamingo/Convert.html) with the route class.

This allows for easy composition and creation of new functionality by overriding route hooks.
See [Tutorial: Basic usage](https://piobyte.github.io/flamingo/tutorial-usage.html) and other documented tutorials on how to write your own, or modify existing routes.
All custom image conversion routes should mix in [Convert](https://piobyte.github.io/flamingo/Convert.html) because it exposes enough hooks for most use-cases (If your use-case isn't implementable, open an issue).

Data is passed through the route in [FlamingoOperation](https://piobyte.github.io/flamingo/FlamingoOperation.html) instances which hold request related metadata.
Image data is transformed using node streams. This means flamingo can convert anything as long as it's available/transformable as image stream 
(i.e. a markdown string can be transformed to a html page which in turn allows the creation of a screenshot which can be streamed into flamingo).

## Contributing

- please follow the [angular git commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit) to structure your commits

## Useful bunyan filters

- only log memwatch stats or leaks `bunyan -c 'this.msg === "stats" || this.msg === "leak"'`
