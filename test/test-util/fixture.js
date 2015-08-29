var RSVP = require('rsvp'),
  path = require('path'),
  fs = require('fs');

var BASE_PATH = 'test/fixtures/',
  Promise = RSVP.Promise,
  loadFixture = function (fixturePath) {
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
  },
  createFullFixturePath = function (fixturePath) {
    return path.resolve(__dirname, '../..', BASE_PATH + fixturePath);
  };

module.exports = {
  loadFixture: loadFixture,
  fullFixturePath: createFullFixturePath
};
