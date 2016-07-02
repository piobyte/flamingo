
Flamingo addons only interact with the base flamingo installation using specific hooks, ie.: `"ENV", "CONF", "PROFILES", "ROUTES", "HAPI_PLUGINS", "LOG_STREAM"`.
For detailed information on available hooks and some examples, look at the [addon documentation](https://piobyte.github.io/flamingo/module-flamingo_src_addon.HOOKS.html).

__"official" addons__

- [flamingo-s3](https://github.com/piobyte/flamingo-s3): provides input from aws s3 buckets
- [flamingo-sentry](https://github.com/piobyte/flamingo-sentry): enable sentry error logging

### Installation

Use npm to install flamingo addons. Example: `npm install flamingo-s3 --save`.
Modify the addon config by overwriting fields inside your `config.js`.

The config loading order is as follows:

1. load addon config
2. merge addon config with flamingo config (flamingo `config.js` fields will overwrite addon fields)
3. overwrite config fields with environment variables

### Discovery

Flamingo will detect package dependencies (and development dependencies [`devDependencies`]) that contain the `"flamingo-addon"` keyword.
Using the specified entry point it'll load the addon and use its hooks.
