/* @flow weak */
var pkg = require('../../package');

/**
 * Flamingo index route
 * @module flamingo/src/routes/index
 */

var BANNER = [
  '<!doctype html><html lang=""><head><title>' + pkg.name + '@' + pkg.version + '</title><style>\n  html{\n    display: table;\n    width: 100%;\n    height: 100%;\n  }\n  body{\n    display: table-cell;\n    vertical-align: middle;\n    text-align: center;\n    color: #222;\n    font-family: "Fira Sans", sans-serif;\n  }\n  h1{\n    font-weight: normal;\n  }\n  a{\n    color: #666;\n  }\n  pre{\n    display: inline-block;\n    text-align: left;\n    font-size: 20px;\n  }\n</style></head><body>',
  '<pre>',
  ' .-.',
  '(-`))',
  '  //',
  ' //',
  '((_.="""=.',
  ' \'.   ,.  \'',
  '   \'-._,)__\'',
  '      |\\   `',
  '    __|_\'',
  '  ((` |',
  '      |',
  '    =="-',
  '',
  '</pre><h1>',
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
      handler: function (req, reply) {
        reply(BANNER);
      }
    }
  };
};
