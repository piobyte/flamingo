const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const Promise = require('bluebird');

const webshot = require('webshot');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

function markdownPreprocessor() {
  return (readerResult) =>
    Promise.resolve(webshot(`<html><body>${md.render(readerResult.markdown)}</body></html>`, {siteType: 'html'}));
}

function MarkdownPreprocess(SuperClass) {
  return class MarkdownPreprocessor extends SuperClass {
    extractInput(operation) {
      return Promise.resolve(decodeURIComponent(operation.request.params.md));
    }

    extractReader(input) {
      return Promise.resolve((operation) => ({markdown: input}));
    }

    preprocess(operation) {
      return markdownPreprocessor(operation);
    }
  };
}

class MarkdownRoute extends MarkdownPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/md/{profile}/{md}', description = 'Profile markdown conversion') {
    super(conf, method, path, description);
  }
}

module.exports = () =>
  Config.fromEnv().then(config => new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new MarkdownRoute(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`) || server));
