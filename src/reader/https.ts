import got = require('got');

import errors = require('../util/errors');
import FlamingoOperation = require('../model/flamingo-operation');
import ReaderType = require('../model/reader-type');
import readAllowed = require('../util/url-access-allowed');
import { ReaderResult } from '../types/ReaderResult';
import pkg = require('../../package.json');

const { InvalidInputError } = errors;
const { REMOTE } = ReaderType;

const headers = {
  'user-agent': `${pkg.name}/${pkg.version} (${pkg.bugs.url})`
};

/**
 * Reader that creates a stream for a given http/https resource
 * @param {object} operation flamingo process operation
 */
export = async function(operation: FlamingoOperation): Promise<ReaderResult> {
  const { config, input: url } = operation;
  const { ACCESS: access, ALLOW_READ_REDIRECT: followRedirect } = config;
  const timeout = config.READER!.REQUEST!.TIMEOUT!;

  if (access!.HTTPS!.ENABLED && !readAllowed(url, access!.HTTPS!.READ)) {
    throw new InvalidInputError(
      'Read not allowed. See `ACCESS.HTTPS.READ` for more information.'
    );
  }

  return {
    async stream() {
      return new Promise((resolve, reject) => {
        const stream = got.stream(url.href, {
          timeout,
          followRedirect,
          headers
        });
        stream.on('error', function(err) {
          stream.pause();
          stream.destroy();
          reject(new InvalidInputError(err.message));
        });
        stream.on('response', function() {
          resolve(stream);
        });
      });
    },
    url,
    type: REMOTE
  };
};
