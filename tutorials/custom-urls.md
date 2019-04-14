# Creating routes under custom urls

- using the default `Route` constructor:
  - `constructor(config, method, path, description)`

## Example usage:

```
<img src="http://localhost:3000/convert/image/avatar-image/http%3A%2F%2Flocalhost%3A9999%2FLandscape_5.jpg">
```

## Implementation

- on server creation, pass a route using the wanted path (`/convert/image/{profile}/{url}` instead of the default `/image/{profile}/{url}`)

### starting the server

```js
return new Server(config, new AddonLoader(__dirname, {}).load())
  .withProfiles([require('../src/profiles/examples')])
  .withRoutes([new Image(config, 'GET', '/convert/image/{profile}/{url}')])
  .start()
  .then(server => console.log(`server running at ${server.uri}`) || server)
```
