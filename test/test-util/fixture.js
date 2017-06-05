const path = require('path');

const BASE_PATH = 'test/fixtures/';

function createFullFixturePath(fixturePath) {
  return path.resolve(__dirname, '../..', BASE_PATH + fixturePath);
}

module.exports = {
  fullFixturePath: createFullFixturePath
};
