import util = require('util');
import Promise = require('bluebird');
import omit = require('lodash/omit');

import Route = require('../model/route');
import FlamingoOperation = require('../model/flamingo-operation');

const pkg = require('../../package.json');

const BASE64_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jbWRMQqDQBBFnyGVSJpUkj72e4/UphUP4FlyAEkteIecIPZeQAlYiW67qTagzKIo+eWy78+fP/Av9Ulm+iQzS/88F9zqAYDQDzg9H+I/gIP0+O4+REXuNXrEGm1SHaeLK+yGxRXqODWNHoHlMsVy6jg1oR8ATDqQChUTWHAOt3pgnkY0iIp8MsXCm1QqZUqltl/Dwi6Towt83e4/oARzvlyhqtZPtga74s+TSHKecQ0M8AXIOlSRGTKPKQAAAABJRU5ErkJggg==';

function banner(route, operation: FlamingoOperation) {
  let html = `
    <!doctype html><html lang=""><head><link rel="icon" href="${BASE64_ICON}">
    <title>${pkg.name}@${pkg.version}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
  html{
    display: table;
    width: 100%;
    height: 100%;
  }
  body{
    display: table-cell;
    vertical-align: middle;
    text-align: center;
    color: #222;
    font-family: "Fira Sans", sans-serif;
  }
  h1{
    font-weight: normal;
  }
  a{
    color: #666;
  }
  img{
    width: 200px;
    image-rendering: -moz-crisp-edges;
    image-rendering: -o-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    -ms-interpolation-mode: nearest-neighbor;
    image-rendering: pixelated;
  }
    </style>
    </head>
    <body>
    <img src="${BASE64_ICON}" alt=""/>
    <h1>${pkg.name}@${pkg.version}</h1>
    <p><a href="${pkg.repository.url}">${pkg.repository.url}</a></p>`;

  if (operation.config.DEBUG) {
    html += `
<style>
.debug{
  padding: 10px;
  text-align: left;
    font-size: 12px;
}
h3,
h2
{
  background: #eee;
  color: #666;
  margin: 0;
  padding: 5px 10px;
  border-bottom: 1px solid #fafafa;
}
h3 a,
h2 a
{
  display: block;
  background: #eee;
  /*color: #fff;*/
  text-decoration: none;
}
h3 a:hover,
h2 a:hover
{
  text-decoration: underline;
}
h2{
  padding: 10px;
}
pre{
  margin: 0;
  padding: 10px;
  background: #fafafa;
  /*color: #fff;*/
  font-family: monospace;
}
</style>
<div class="debug">
<h2>Debug</h2>
<a name="config"></a>
<h3><a href="#config">Config</a></h3>
<pre>${util.inspect(omit(operation.config, 'CRYPTO'))}</pre>
<a name="profiles"></a>
<h3><a href="#profiles">Profiles</a></h3>
<pre>${util.inspect(route.server.profiles)}</pre>
<a name="addons"></a>
<h3><a href="#addons">Addons</a></h3>
<pre>${util.inspect(
      route.server.addonsLoader.addons.map(
        addon => `${addon.pkg.name}@${addon.pkg.version}`
      )
    )}</pre>
</div>
  `;
  }
  return `${html}</body></html>`;
}

/**
 * Index route that exposes some metadata
 * @class
 * @extends Route
 */
class Index extends Route {
  /**
   *
   * @param {Config} config
   * @param {string} [method='GET']
   * @param {string} [path='/']
   * @param {string} [description='Index route']
   */
  constructor(config, method = 'GET', path = '/', description = 'Index route') {
    super(config, method, path, description);
  }

  handle(operation) {
    return Promise.resolve(operation.reply(banner(this, operation)));
  }
}

export = Index;
