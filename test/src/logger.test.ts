import temp = require('temp');
import fs = require('fs');
import assert = require('assert');
import url = require('url');

import FlamingoOperation = require('../../src/model/flamingo-operation');
import Route = require('../../src/model/route');
import logger = require('../../src/logger');
import Bluebird = require('bluebird');
import { Request } from '../../src/types/HTTP';

const readFile = Bluebird.promisify(fs.readFile);

describe('logger', function() {
  it.skip('checks that the method calls the stream function', async function() {
    const tempPath = temp.path({ suffix: '.log' });
    const loggerName = 'test:logger.addStreams';
    const LOG_MESSAGE = 'Time is an illusion. Lunchtime doubly so.';

    logger.addStreams([
      {
        name: 'temp',
        level: 'fatal',
        path: tempPath
      }
    ]);

    const log = logger.build(loggerName);
    log.fatal(LOG_MESSAGE);

    const data = await readFile(tempPath);
    assert.equal(JSON.parse(data.toString('utf8')).msg, LOG_MESSAGE);
  });

  it('serializes request log objects', function() {
    const REQUEST = {
      headers: 'headers',
      url: '/foo',
      method: 'GET'
    };
    const serialized = logger.serializers.request(REQUEST);

    assert.strictEqual(serialized.headers, REQUEST.headers);
    assert.strictEqual(serialized.method, REQUEST.method);
    assert.strictEqual(serialized.url, REQUEST.url);
    assert.ok(
      logger.serializers.request('foo'),
      "it doesn't break on invalid input"
    );
  });

  it('serializes routes', function() {
    const route = new Route({}, 'POST', '/post-me', 'some post route');
    const serialized = logger.serializers.route(route);

    assert.deepEqual(serialized, {
      description: 'some post route',
      method: 'POST',
      name: 'Route',
      path: '/post-me'
    });
    assert.ok(
      logger.serializers.route(42),
      "it doesn't break on invalid input"
    );
  });

  it('serializes request error objects', function() {
    /* eslint no-underscore-dangle: 0 */
    let err;
    try {
      JSON.parse('foo');
    } catch (e) {
      err = e;
    }

    // check if the serialized object has the stack property
    assert.ok(logger.serializers.error(err).hasOwnProperty('stack'));
    assert.ok(
      logger.serializers.error(2) !== undefined,
      "won't break on non error objects"
    );
    assert.ok(
      logger.serializers.error(NaN) !== undefined,
      "won't break on non error objects"
    );
  });

  it('serializes request error strings', function() {
    /* eslint no-underscore-dangle: 0 */

    assert.strictEqual(logger.serializers.error('pls halp'), 'pls halp');
  });

  it('serializes input', function() {
    assert.deepEqual(
      logger.serializers.input('# Headline\nsome markdown'),
      '# Headline\nsome markdown'
    );
    assert.deepEqual(
      logger.serializers.input(url.parse('http://zombo.com/')),
      url.format(url.parse('http://zombo.com'))
    );
    assert.deepEqual(
      logger.serializers.input({ some: 'object' }),
      "{ some: 'object' }"
    );
  });

  it('serializes operation object', function() {
    const operation = new FlamingoOperation();
    operation.input = url.parse(
      'https://travis-ci.org/piobyte/flamingo.svg?branch=master'
    );
    operation.request = ({
      headers: { 'user-agent': 'flamingo/2.0.0' },
      params: {
        profile: 'example-profile',
        id: '12345'
      },
      method: 'GET'
    } as any) as Request;

    assert.deepEqual(logger.serializers.operation(operation), {
      input: 'https://travis-ci.org/piobyte/flamingo.svg?branch=master'
    });
  });
});
