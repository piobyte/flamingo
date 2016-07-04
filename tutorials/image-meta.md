# Creating a route that returns image metadata (size, mime) as json

- no image conversion -> simply extend Route

## Example usage:

```
curl http://localhost:3000/image/https%3A%2F%2Fd11xdyzr0div58.cloudfront.net%2Fstatic%2Farchnavbar%2Farchlogo.4fefb38dc270.png
# {"width":190,"height":40,"type":"png","mime":"image/png","wUnits":"px","hUnits":"px","length":4192}
```

## Implementation

- route url `/image/{url}`
- input extraction resolves `url` request param
- handler probes the url for information and returns them
- use [probe-image-size](https://www.npmjs.com/package/probe-image-size) for easy image size extraction

### Route

```js
class ImageMetaRoute extends Route {
  constructor(conf, method = 'GET', path = '/image/{url}', description = 'Image metadata conversion') {
    super(conf, method, path, description);
  }

  extractInput(operation) {
    return operation.config.DECODE_PAYLOAD(decodeURIComponent(operation.request.params.url))
      .then(decoded => url.parse(decoded));
  }

  handle(operation) {
    return this.extractInput(operation)
      .then(inputUrl => probe(url.format(inputUrl)))
      .then(result => operation.reply(result));
  }
}
```

### starting the server

```js
Config.fromEnv().then(config => {
  config.DECODE_PAYLOAD = (payload) => Promise.resolve(payload);

  return new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new ImageMetaRoute(config)])
    .start()
    .then(server => console.log(`server running at ${server.hapi.info.uri}`));
});
```

## Future ideas

- use [color-thief](https://github.com/null2/color-thief) and also extract average color

