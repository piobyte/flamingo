'use strict';

/**
 * Flamingo index route
 * @module flamingo/src/routes/index
 */

const pkg = require('../../package');
const Route = require('../model/route');
const util = require('util');

var BASE64_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jbWRMQqDQBBFnyGVSJpUkj72e4/UphUP4FlyAEkteIecIPZeQAlYiW67qTagzKIo+eWy78+fP/Av9Ulm+iQzS/88F9zqAYDQDzg9H+I/gIP0+O4+REXuNXrEGm1SHaeLK+yGxRXqODWNHoHlMsVy6jg1oR8ATDqQChUTWHAOt3pgnkY0iIp8MsXCm1QqZUqltl/Dwi6Towt83e4/oARzvlyhqtZPtga74s+TSHKecQ0M8AXIOlSRGTKPKQAAAABJRU5ErkJggg==';

function banner(operation) {
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
<pre>${util.inspect(operation.config)}</pre>
<a name="profiles"></a>
<h3><a href="#profiles">Profiles</a></h3>
<pre>${util.inspect(operation.profiles)}</pre>
<a name="addons"></a>
<h3><a href="#addons">Addons</a></h3>
<pre>${util.inspect(operation.addons)}</pre>
</div>
  `;
  }
  return `${html}</body></html>`;
}

class Index extends Route {
  constructor(config = {}) {
    super(config, 'GET', '/', 'Index');
  }

  handle(operation) {
    return operation.reply(banner(operation));
  }
}

module.exports = Index;

