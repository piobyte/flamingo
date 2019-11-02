- `npm i -s flamingo`
- `npm i -s flamingo-sentry`

`flamingo-sentry` is an addon that only relies on addon hooks (`ENV`, `CONF` and `LOG_STREAM`), 
which mean you don't have to change anything except providing config values for sentry.
Upon starting flamingo, the addon loader will automatically locate and run `flamingo-sentry`.

## Configuring via environment variables

See {@link module:flamingo-sentry/index|ENV} for all existing environment mappings.

To start with custom environment variables, run i.e. 
```sh
SENTRY_DSN="http://dc462d2107cfc8d8f722043f1181ae4d:c1d154a0e7cedf19b070fa252534bd14@sentry.example.org:1234/5" node my-flamingo.js
```
<!--- 'http://' + chance.hash({length: 32}) + ':' + chance.hash({length:32}) + '@sentry.example.org:1234/5' -->
