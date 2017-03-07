import got = require('got');
import Promise = require('bluebird');

import errors = require('../util/errors');
import FlamingoOperation = require('../model/flamingo-operation');
import ReaderType = require('../model/reader-type');
import readAllowed = require('../util/url-access-allowed');
import { ReaderResult } from '../types/ReaderResult';

const { InvalidInputError } = errors;
const pkg = require('../../package.json');
const { REMOTE } = ReaderType;

/**
 * Reader that creates a stream for a given http/https resource
 * @param {object} operation flamingo process operation
 */
export = function(operation: FlamingoOperation): Promise<ReaderResult> {
  const conf = operation.config;
  const input = operation.input;
  const access = conf.ACCESS;

  return access.HTTPS.ENABLED && !readAllowed(input, access.HTTPS.READ)
    ? Promise.reject(
        'Read not allowed. See `ACCESS.HTTPS.READ` for more information.'
      )
    : Promise.resolve({
        stream() {
          return new Promise(function(resolve, reject) {
            const stream = got.stream(input.href, {
              timeout: conf.READER.REQUEST.TIMEOUT,
              followRedirect: conf.ALLOW_READ_REDIRECT,
              headers: {
                'user-agent': `${pkg.name}/${pkg.version} (${pkg.bugs.url})`
              }
            });
            stream.on('error', function(err) {
              reject(new InvalidInputError(err.message, input.href));
            });
            stream.on('response', function() {
              resolve(stream);
            });
          });
        },
        url: input,
        type: REMOTE
      });
};
