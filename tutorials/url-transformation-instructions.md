# Creating a convert route that builds the processing instruction out of the request params

- based on Image route

## Example usage

```html
<img src="http://localhost:3000/inline/image/resize=300:100,toFormat=webp,rotate=90,min/http%3A%2F%2Flocalhost%3A9999%2FLandscape_5.jpg" alt="converted image">
```

## Implementation

- route url `/inline/image/{transforms}/{url}`
- overwrites the default `extractProcess` implementation to build the process response out
of the `transforms` url param
- transformation is encoded as string
  - `toFormat=webp,resize=300:100,rotate=90,min` will generate:

```js
{
  response: {},
  process: [{
    processor: 'sharp',
    pipe: (pipe) => 
      pipe.toFormat('webp')
        .resize(300,100)
        .rotate(90)
        .min()
  }]
}
```

## Route mixin

```js
function UrlTransformationInstructions(SuperClass) {
  return class extends SuperClass {
    extractProcess(operation) {
      return operationToProcess(operation);
    }
  };
}
```

### Decodation method

```js
function operationToProcess(operation) {
  const processes = operation.request.params.transforms.split(';');
  return Promise.resolve({
    response: {},
    process: processes.map(processString => {
      const ops = processString.split(',').map(operation => {
        const operationSplit = operation.split('=');
        const args = operationSplit.slice(1).map(arg => {
          const floatArg = parseFloat(arg);
          return isNaN(floatArg) ? arg : floatArg;
        });
        return [operationSplit[0], ...args];
      });

      const pipeFn = function (pipe) {
        ops.forEach(([method, ...args]) => {
          pipe = pipe[method](...args);
        });
        return pipe;
      };

      return {
        processor: 'sharp',
        pipe: pipeFn
      };
    })
  });
}
````

### Route

```js
class UrlTransformationInstructionsRoute extends UrlTransformationInstructions(Image) {
  constructor(conf, method = 'GET', path = '/inline/image/{transforms}/{url}', description = 'Route that builds the transform instruction by extracting it from the given url param') {
    super(conf, method, path, description);
  }
}
```

### starting the server

```js
module.exports = () =>
  Config.fromEnv().then(config => {
    config = merge({}, config, {CRYPTO: {ENABLED: false}});
    return new Server(config, new AddonLoader(__dirname, {}).load())
      .withRoutes([new UrlTransformationInstructionsRoute(config)])
      .start()
      .then(server => logger.info(`server running at ${server.uri}`) || server);
  });
```
