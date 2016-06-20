# Creating a markdown to image route

- concept is equal to the video route:
  - add a preprocessor that converts an md string to an image stream
- means we can extend the image route in the same way video does (`class MarkdownRoute extends MarkdownPreprocess(Image) {}`)

## Example usage:

```html
<img src="http://localhost:3000/md/preview-image/%23%20headline%0A%0Awasd?size=500" alt="headline wasd">
```

## Implementation

- input extraction resolves `md` request param (url: `/md/{profile}/{md}`)
- reader returns `{markdown: <MardownString>}` object
- use [markdown-it](https://github.com/markdown-it/markdown-it) to generate html from markdown
- use [node-webshot](https://github.com/brenden/node-webshot) to generate image stream from html 
(__Note:__ node-webshot is currently not compatible with node@6 until [node-webshot/#150](https://github.com/brenden/node-webshot/pull/150) is merged. Use `npm i "github:brenden/node-webshot#pull/150/head"`)

### Route mixin

```js
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
```

### Markdown preprocessor function

```js
function markdownPreprocessor() {
  return (readerResult) =>
    Promise.resolve(webshot(`<html><body>${md.render(readerResult.markdown)}</body></html>`, {siteType: 'html'}));
}
```

### Route

```js
class MarkdownRoute extends MarkdownPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/md/{profile}/{md}', description = 'Profile markdown conversion') {
    super(conf, method, path, description);
  }
}
```

### starting the server

```js
Config.fromEnv().then(config => {
  config.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);

  return new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new MarkdownRoute(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
```

