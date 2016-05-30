var pkg = require('../../package'),
  FlamingoOperation = require('../util/flamingo-operation');

exports.register = function (server, options, next) {
  server.ext('onPreHandler', function (request, reply) {
    /* istanbul ignore else */
    if (request) {
      var flamingoOperation = new FlamingoOperation();
      flamingoOperation.request = request;
      // can't also configure reply because the reply function changes later on → wrong reply called
      request.flamingoOperation = flamingoOperation;
    }

    reply.continue();
  });

  next();
};
exports.register.attributes = {
  name: 'request-flamingo-operation',
  version: pkg.version
};
