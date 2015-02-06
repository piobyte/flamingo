var server = require('./src/server'),
    conf = require('./config');

var logger = require('./src/logger')();

function parseIntNaN(value, nanDefault) {
    var parsed = parseInt(value, 10);
    if (isNaN(parsed)) { parsed = nanDefault; }
    return parsed;
}

// overwrite config with environment variables
if (process.env.PORT) { conf.PORT = parseIntNaN(process.env.PORT, 3000); }

if (process.env.ROUTE_CUSTOM_CONVERT) { conf.ROUTES.CUSTOM_CONVERT = process.env.ROUTE_CUSTOM_CONVERT === 'true'; }
if (process.env.ROUTE_PROFILE_CONVERT) { conf.ROUTES.PROFILE_CONVERT = process.env.ROUTE_PROFILE_CONVERT === 'true'; }
if (process.env.ROUTE_INDEX) { conf.ROUTES.INDEX = process.env.ROUTE_INDEX === 'true'; }

if (process.env.RATE_LIMIT_ALL_REQUESTS) { conf.RATE_LIMIT.ALL.REQUESTS = parseIntNaN(process.env.RATE_LIMIT_ALL_REQUESTS, 50); }
if (process.env.RATE_LIMIT_ALL_TIME) { conf.RATE_LIMIT.ALL.TIME = process.env.RATE_LIMIT_ALL_TIME; }
if (process.env.RATE_LIMIT_ALL_WAIT_FOR_TOKEN) { conf.RATE_LIMIT.ALL.WAIT_FOR_TOKEN = process.env.RATE_LIMIT_ALL_WAIT_FOR_TOKEN === 'true'; }

if (process.env.CRYPTO_IV) { conf.CRYPTO.IV = new Buffer(process.env.CRYPTO_IV); }
if (process.env.CRYPTO_KEY) { conf.CRYPTO.KEY = new Buffer(process.env.CRYPTO_KEY, 'base64'); }
if (process.env.CRYPTO_CIPHER) { conf.CRYPTO.CIPHER = process.env.CRYPTO_CIPHER; }

if (process.env.PROFILES_DIR) { conf.PROFILES_DIR = process.env.PROFILES_DIR; }

if (process.env.READER_REQUEST_TIMEOUT) { conf.READER.REQUEST.TIMEOUT = parseIntNaN(process.env.READER_REQUEST_TIMEOUT, 10 * 1000); }

process.on('uncaughtException', function (err) {
    logger.error(err);
});

server(conf).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
