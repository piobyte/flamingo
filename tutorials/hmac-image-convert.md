# Creating a hmac validated profile image convert route

- same as regular profile image convert route
- uses the `validOperation(operation)` hook to validate the incoming operation
- validation via `crypto.createHmac('sha256)`

## Example usage:

```html
<img src="http://localhost:3000/image/preview-image/8ed2a7dcd4837ed6da0fc4cb3f3f5c4acfe8465081cbd1580412638bb057ec4b/https%3A%2F%2Fwww.wikipedia.org%2Fportal%2Fwikipedia.org%2Fassets%2Fimg%2FWikipedia-logo-v2.png" alt="wikipedia logo">
```

## Implementation

- route url `/image/{profile}/{signature}/{url}`
- generate hash from all request params except the `signature` param
- compare generated hash with hash given in `signature` param

### Route mixin

```js
function HmacImageConvert(superClass) {
  return class HmacImageConverter extends superClass{
    buildMessage(op){
      const query = qs.stringify(op.request.query);
      const params = qs.stringify(pickBy(op.request.params, (val, key) => key !== 'signature'));

      return `${params}|${query}`;
    }

    extractDigest(op){
      return op.request.params.signature;
    }

    validOperation(op) {
      return hmacValidateOperation(op, this.extractDigest(op), this.buildMessage(op));
    }

    extractInput(operation) {
      return Promise.resolve(url.parse(decodeURIComponent(operation.request.params.url)));
    }
  };
}
```

### Hmac validation function

```js
function hmacValidateOperation(operation, givenDigest, enc) {
  const hmac = crypto.createHmac('sha256', operation.config.CRYPTO.HMAC_KEY);

  hmac.update(`${enc}`);

  const digest = hmac.digest('hex');

  if (digest === givenDigest) {
    return Promise.resolve(operation);
  } else {
    throw new InvalidInputError(`given hash (${givenDigest}) doesn't match expected hash (${digest})`);
  }
}
```

### Route

```js
class HmacImageConvertRoute extends HmacImageConvert(Image) {
  constructor(conf, method = 'GET', path = '/image/{profile}/{signature}/{url}', description = 'Profile image conversion with additional hmac check') {
    super(conf, method, path, description);
  }
}
```

### starting the server

```js
Config.fromEnv().then(config => {
  return new Server(config, new AddonLoader(__dirname, {}).load())
    .withProfiles([require('../src/profiles/examples')])
    .withRoutes([new HmacImageConvertRoute(config)])
    .start()
    .then(server => console.log(`server running at ${server.uri}`));
});
```

