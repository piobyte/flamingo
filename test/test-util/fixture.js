const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');

const BASE_PATH = 'test/fixtures/';

function loadFixture(fixturePath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(__dirname, '../../', BASE_PATH + fixturePath), {
      encoding: 'utf-8'
    }, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
function createFullFixturePath(fixturePath) {
  return path.resolve(__dirname, '../..', BASE_PATH + fixturePath);
}

module.exports = {
  loadFixture: loadFixture,
  fullFixturePath: createFullFixturePath
};
