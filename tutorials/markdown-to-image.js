const Image = require('../src/routes/image');
const Server = require('../src/model/server');
const Config = require('../config');
const AddonLoader = require('../src/addon/loader');
const logger = require('../src/logger').build('tutorials/markdown-to-image');
const merge = require('lodash/merge');

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

    preprocess() {
      return markdownPreprocessor();
    }
  };
}

class MarkdownRoute extends MarkdownPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/md/{profile}/{md}', description = 'Profile markdown conversion') {
    super(conf, method, path, description);
  }
}

module.exports = (additionalConfig = {}) =>
  Config.fromEnv().then(config => {
    config = merge({}, config, additionalConfig);
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new MarkdownRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.uri}`) || server);
  });
