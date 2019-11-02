# Creating a route that returns image metadata (size, mime) as json

- does everything a regular conversion does except calling [sharp.metadata](http://sharp.dimens.io/en/stable/api/#metadatacallback) on the input stream
- mixes `Convert` with `Route` to get existing reader extraction and stream validation behavior

## Example usage:

```
curl http://localhost:3000/image/https%3A%2F%2Fd11xdyzr0div58.cloudfront.net%2Fstatic%2Farchnavbar%2Farchlogo.4fefb38dc270.png
# {"format":"png","width":190,"height":40,"space":"srgb","channels":4,"density":90,"hasProfile":false,"hasAlpha":true}
```

## Implementation

- route url `/image/{url}`
- input extraction resolves `url` request param
- overwrites `process` to simply call [sharp.metadata](http://sharp.dimens.io/en/stable/api/#metadatacallback) and resolve the object
- overwrites `write` to simply reply with the extracted metadata object

### Route

```js
class ImageMetaRoute extends Convert(Route) {
  constructor(conf, method = 'GET', path = '/image/{url}', description = 'Image metadata conversion') {
    super(conf, method, path, description);
  }

  extractInput(operation) {
    operation.input = url.parse(operation.request.params.url);
    return Promise.resolve(operation.input);
  }

  process() {
    return (stream) =>
      new Promise((resolve, reject) =>
        stream.pipe(sharp().metadata((err, data) => {
          if (err) {
            reject(new InvalidInputError(err));
          } else {
            resolve(data);
          }
        })));
  }

  write(operation){
    return (metadata) => operation.reply.response(metadata);
  }
}
```

### starting the server

```js
Config.fromEnv().then(config => new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new ImageMetaRoute(config)])
    .start()
    .then(server => logger.info(`server running at ${server.hapi.info.uri}`)))
```

## Future ideas

- use [color-thief](https://github.com/null2/color-thief) and also extract average color

