# Creating a website to image route

- same as markdown to image except a different preprocess function

## Example usage:

```html
<img src="http://localhost:3000/www/preview-image/https%3A%2F%2Fwww.google.com" alt="google screenshot">
```

## Implementation

- route url `/www/{profile}/{url}`
- input extraction resolves `url` request param
- reader returns `{url: <requested website url>}` object
- use [screenshot-stream](https://github.com/kevva/screenshot-stream) to generate image stream from an url

### Route mixin

```js
function WebsiteScreenshotPreprocess(SuperClass) {
  return class WebsiteScreenshotPreprocessor extends SuperClass {
    extractInput(operation) {
      return Promise.resolve(decodeURIComponent(operation.request.params.url));
    }

    extractReader(input) {
      return Promise.resolve((operation) => ({url: input}));
    }

    preprocess(operation) {
      return (readerResult) =>
        Promise.resolve(screenshot(readerResult.url, '1024x768', {delay: 1, crop: true}));
    }
  };
}
```

### Route

```js
class WebsiteScreenshotRoute extends WebsiteScreenshotPreprocess(Image) {
  constructor(conf, method = 'GET', path = '/www/{profile}/{url}', description = 'Profile website screenshot conversion') {
    super(conf, method, path, description);
  }
}
```

### starting the server

```js
Config.fromEnv().then(config => 
    new Server(config, new AddonLoader(__dirname, {}).load())
      .withProfiles([require('../src/profiles/examples')])
      .withRoutes([new WebsiteScreenshotRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.hapi.info.uri}`)));
```

