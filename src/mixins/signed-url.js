'use strict';

const requestSignature = require('../util/request-signature');
const qs = require('querystring');
const pickBy = require('lodash/pickBy');

module.exports = (SuperClass) => {
  /**
   * Mixin that adds operation validation based on a signature request param
   * @class
   */
  return class SignedUrl extends SuperClass {
    /**
     * Builds the string that is going to be passed into the hashing function
     * @param op
     * @returns {string}
       */
    buildMessage(op){
      const query = qs.stringify(op.request.query);
      const params = qs.stringify(pickBy(op.request.params, (val, key) => key !== 'signature'));

      return `${params}|${query}`;
    }

    /**
     * Extracts a digest to be used to validate the incoming request
     * @param op
     * @returns {*}
       */
    extractDigest(op){
      return op.request.params.signature;
    }

    /**
     * Overwrites the validOperation method to compare an extracted digest with a hashed string based on the incoming request.
     * @param op
       */
    validOperation(op) {
      return requestSignature(op, this.extractDigest(op), this.buildMessage(op));
    }
  };
};
