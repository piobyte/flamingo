var server = require('./src/server'),
    conf = require('./config');

var logger = require('./src/logger')();

function parseIntNaN(portString, nanDefault) {
    var parsed = parseInt(portString, 10);
    if (isNaN(conf.PORT)) { conf.PORT = nanDefault; }
    return parsed;
}

// overwrite config with environment variables
if (process.env.PORT) { conf.PORT = parseIntNaN(process.env.PORT, 3000); }
if (process.env.SECRET) { conf.SECRET = process.env.SECRET; }
if (process.env.CIPHER) { conf.CIPHER = process.env.CIPHER; }
if (process.env.ROUTE_CUSTOM_CONVERT) { conf.ROUTES.CUSTOM_CONVERT = process.env.ROUTE_CUSTOM_CONVERT === 'true'; }
if (process.env.ROUTE_PROFILE_CONVERT) { conf.ROUTES.PROFILE_CONVERT = process.env.ROUTE_PROFILE_CONVERT === 'true'; }
if (process.env.ROUTE_INDEX) { conf.ROUTES.INDEX = process.env.ROUTE_INDEX === 'true'; }
if (process.env.RATE_LIMIT_ALL_REQUESTS) { conf.RATE_LIMIT.REQUESTS = parseIntNaN(process.env.RATE_LIMIT_ALL_REQUESTS, 50); }
if (process.env.RATE_LIMIT_ALL_TIME) { conf.RATE_LIMIT.ALL.TIME = process.env.RATE_LIMIT_ALL_TIME; }
if (process.env.RATE_LIMIT_ALL_WAIT_FOR_TOKEN) { conf.RATE_LIMIT.ALL.WAIT_FOR_TOKEN = process.env.RATE_LIMIT_ALL_WAIT_FOR_TOKEN === 'true'; }

server(conf).then(function () {
    logger.info('Server listening on port ' + conf.PORT);
}, function (err) {
    logger.err(err);
});
