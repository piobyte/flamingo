var sinon = require('sinon'),
    assert = require('assert');

describe('file access allowed result test', function () {
    var method = require('../../../src/util/file-access-allowed');

    it('checks whitelisted directories resolve', function (done) {
        method('/my/allowed/path.png', ['/my/allowed'])
            .then(function(){ done();}, function(reject) { done(reject); } );
    });

    it('check whitelisted directories reject', function (done) {
        method('/my/not-allowed/path.png', ['/my/allowed'])
            .then(function(){
                assert.fail('Shouldn\'t reach this code.');
                done();
            }, function() {
                done();
            });
    });
});
