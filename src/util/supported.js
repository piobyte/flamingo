/* @flow weak */
var RSVP = require('rsvp'),
    temp = require('temp'),
    path = require('path'),
    fs = require('fs'),
    through2 = require('through2'),
    gmProcessor = require('../processor/image/gm');

function hasGmWebp(){
    return new RSVP.Promise(function (resolve) {
        var resultLength = 0,
            out = temp.createWriteStream(),
            input = fs.createReadStream(path.join(__dirname, '../../test/fixtures/images/base64.png'));

        out.on('finish', function () {
            resolve(resultLength > 0);
            out.end();
        });

        try{
            gmProcessor(function (pipe) {
                return pipe.options({imageMagick: true}).setFormat('webp');
            }, input).pipe(through2(function (chunk, enc, callback) {
                resultLength += chunk.length;
                this.push(chunk);
                callback();
            })).pipe(out);
        } catch (e) {
            resolve(false);
        }
    });
}

module.exports = function ()/*: function */ {
    var supported = {GM: {}};
    temp.track();

    return RSVP.all([
        hasGmWebp()
    ]).then(function (results) {
        /*eslint no-sync: 0*/
        temp.cleanupSync();

        supported.GM.WEBP = results[0];

        return supported;
    });
};
