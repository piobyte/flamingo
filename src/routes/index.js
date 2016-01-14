/* @flow */
var pkg = require('../../package');

/**
 * Flamingo index route
 * @module flamingo/src/routes/index
 */

var BASE64_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jbWRMQqDQBBFnyGVSJpUkj72e4/UphUP4FlyAEkteIecIPZeQAlYiW67qTagzKIo+eWy78+fP/Av9Ulm+iQzS/88F9zqAYDQDzg9H+I/gIP0+O4+REXuNXrEGm1SHaeLK+yGxRXqODWNHoHlMsVy6jg1oR8ATDqQChUTWHAOt3pgnkY0iIp8MsXCm1QqZUqltl/Dwi6Towt83e4/oARzvlyhqtZPtga74s+TSHKecQ0M8AXIOlSRGTKPKQAAAABJRU5ErkJggg==',
  BANNER = [
    '<!doctype html><html lang=""><head><link rel="icon" href="' + BASE64_ICON + '"><title>' + pkg.name + '@' + pkg.version + '</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>\n  html{\n    display: table;\n    width: 100%;\n    height: 100%;\n  }\n  body{\n    display: table-cell;\n    vertical-align: middle;\n    text-align: center;\n    color: #222;\n    font-family: "Fira Sans", sans-serif;\n  }\n  h1{\n    font-weight: normal;\n  }\n  a{\n    color: #666;\n  }\n  img{\n    width: 200px;\n    image-rendering: -moz-crisp-edges;\n    image-rendering: -o-crisp-edges;\n    image-rendering: -webkit-optimize-contrast;\n    -ms-interpolation-mode: nearest-neighbor;\n    image-rendering: pixelated;\n  }\n</style></head><body>',
    '<img src="' + BASE64_ICON + '" alt=""/>',
    '<h1>',
    pkg.name + '@' + pkg.version,
    '</h1><p><a href="' + pkg.repository.url + '">' + pkg.repository.url + '</a></p>',
    '</body></html>'].join('\n');

/**
 * Function to generate the index route hapi configuration
 * @return {{method: string, path: string, config: {handler: Function}}} hapi route configuration
 * @see http://hapijs.com/api#serverrouteoptions
 * @see GET /
 */
module.exports = function ()/*: {method: string; path: string; config: {handler: function} }*/ {
  return {
    method: 'GET',
    path: '/',
    config: {
      state: { parse: false },
      handler: function (req, reply) {
        reply(BANNER);
      }
    }
  };
};
