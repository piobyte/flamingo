var assert = require('assert'),
  sinon = require('sinon'),
  noop = require('lodash/utility/noop'),
  sharp = require('sharp'),
  RSVP = require('rsvp'),
  exampleProfiles = require('../../../src/profiles/examples');

describe('example profiles', function () {

  describe('avatar-image', function () {
    it('uses gm with defaults', function (done) {
      var pipe = {
        options: noop,
        autoOrient: noop,
        setFormat: noop,
        resize: noop,
        background: noop,
        gravity: noop,
        extent: noop
      };
      sinon.stub(pipe, 'autoOrient').returns(pipe);
      sinon.stub(pipe, 'setFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(170).returns(pipe);
      sinon.stub(pipe, 'background').withArgs('transparent').returns(pipe);
      sinon.stub(pipe, 'gravity').withArgs('Center').returns(pipe);
      sinon.stub(pipe, 'extent').withArgs(170, 170).returns(pipe);

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

    it('uses imagemagick for webp images if supported', function (done) {
      var pipe = {
        options: noop,
        autoOrient: noop,
        setFormat: noop,
        resize: noop,
        background: noop,
        gravity: noop,
        extent: noop
      };
      sinon.stub(pipe, 'options').withArgs({imageMagick: true}).returns(pipe);
      sinon.stub(pipe, 'autoOrient').returns(pipe);
      sinon.stub(pipe, 'setFormat').withArgs('webp').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(170).returns(pipe);
      sinon.stub(pipe, 'background').withArgs('transparent').returns(pipe);
      sinon.stub(pipe, 'gravity').withArgs('Center').returns(pipe);
      sinon.stub(pipe, 'extent').withArgs(170, 170).returns(pipe);

      exampleProfiles['avatar-image']({
        headers: {accept: 'image/webp,image/*,*/*;q=0.8'},
        query: {}
      }, {
        DEFAULT_MIME: 'image/png',
        SUPPORTED: {GM: {WEBP: true}}
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);

        done();
      }).catch(done);
    });

    it('allows to set the image size via query param', function (done) {
      var pipe = {
        options: noop,
        autoOrient: noop,
        setFormat: noop,
        resize: noop,
        background: noop,
        gravity: noop,
        extent: noop
      };
      sinon.stub(pipe, 'options').withArgs({imageMagick: true}).returns(pipe);
      sinon.stub(pipe, 'autoOrient').returns(pipe);
      sinon.stub(pipe, 'setFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(200).returns(pipe);
      sinon.stub(pipe, 'background').withArgs('transparent').returns(pipe);
      sinon.stub(pipe, 'gravity').withArgs('Center').returns(pipe);
      sinon.stub(pipe, 'extent').withArgs(200, 200).returns(pipe);

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
  });

});
