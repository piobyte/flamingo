'use strict';

const requestSignature = require('../util/request-signature');
const qs = require('querystring');
const pickBy = require('lodash/pickBy');

module.exports = (SuperClass) => {
  return class SignedUrl extends SuperClass {
    buildMessage(op){
      const query = qs.stringify(op.request.query);
      const params = qs.stringify(pickBy(op.request.params, (val, key) => key !== 'signature'));

      return `${params}|${query}`;
    }

    extractDigest(op){
      return op.request.params.signature;
    }

    validOperation(op) {
      return requestSignature(op, this.extractDigest(op), this.buildMessage(op));
    }
  };
};
