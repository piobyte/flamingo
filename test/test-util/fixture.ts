import path = require('path');
import fs = require('fs');
import Promise = require('bluebird');

const BASE_PATH = 'test/fixtures/';

function createFullFixturePath(fixturePath) {
  return path.resolve(__dirname, '../..', BASE_PATH + fixturePath);
}

export = {
  fullFixturePath: createFullFixturePath
};
