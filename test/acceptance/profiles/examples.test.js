var assert = require('assert'),
  sinon = require('sinon'),
  noop = require('lodash/noop'),
  sharp = require('sharp'),
  RSVP = require('rsvp'),
  exampleProfiles = require('../../../src/profiles/examples');

describe('example profiles', function () {

  describe('avatar-image', function () {
    it('uses sharp with defaults', function (done) {
      var pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(170, 170).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['avatar-image']({
        headers: {accept: ''},
        query: {}
      }, {
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('allows to set the image size via query param', function (done) {
      var pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(200, 200).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: ''}
      }, {
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {
        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('uses client hints dpr to scale images', function (done) {
      var pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(400, 400).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('uses client hints width to resize images', function (done) {
      var pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(600, 600).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '1', width: '600'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 1,
          'Content-Type': 'image/png',
          'Vary': 'Width'
        });

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });
  });

  describe('preview-image', function () {
    it('uses sane default values', function (done) {
      var pipe = {
        rotate: noop,
        background: noop,
        flatten: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };

      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'background').withArgs('white').returns(pipe);
      sinon.stub(pipe, 'flatten').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(200).returns(pipe);
      sinon.stub(pipe, 'min').returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['preview-image']({
        headers: {accept: ''},
        query: {}
      }, {
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });
    it('clamps dimension to 10..1024', function (done) {
      var pipe = {
        rotate: noop,
        background: noop,
        flatten: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };

      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'background').withArgs('white').returns(pipe);
      sinon.stub(pipe, 'flatten').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(1024).returns(pipe).withArgs(10).returns(pipe);
      sinon.stub(pipe, 'min').returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      RSVP.hash({
        lower: exampleProfiles['preview-image']({
          headers: {accept: ''},
          query: {width: '0'}
        }, {
          DEFAULT_MIME: 'image/png',
          SUPPORTED: {GM: {}}
        }),
        upper: exampleProfiles['preview-image']({
          headers: {accept: ''},
          query: {width: '2000'}
        }, {
          DEFAULT_MIME: 'image/png',
          SUPPORTED: {GM: {}}
        })
      }).then(function(data){
        data.lower.process[0].pipe(pipe);
        data.upper.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('uses client hints dpr to scale images', function (done) {
      var pipe = {
        rotate: noop,
        background: noop,
        flatten: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };

      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'background').withArgs('white').returns(pipe);
      sinon.stub(pipe, 'flatten').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(400).returns(pipe);
      sinon.stub(pipe, 'min').returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['preview-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('uses client hints width to resize images', function (done) {
      var pipe = {
        rotate: noop,
        background: noop,
        flatten: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };

      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'background').withArgs('white').returns(pipe);
      sinon.stub(pipe, 'flatten').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(600).returns(pipe);
      sinon.stub(pipe, 'min').returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      exampleProfiles['preview-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '1', width: '600'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {}}
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 1,
          'Content-Type': 'image/png',
          'Vary': 'Width'
        });

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });
  });

});
