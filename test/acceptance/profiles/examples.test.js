const assert = require('assert');
const sinon = require('sinon');
const noop = require('lodash/noop');
const sharp = require('sharp');
const Promise = require('bluebird');
const exampleProfiles = require('../../../src/profiles/examples');

describe('example profiles', function () {

  describe('avatar-image', function () {
    it('uses sharp with defaults', function () {
      const pipe = {
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

      return exampleProfiles['avatar-image']({
        headers: {accept: ''},
        query: {}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });

    it('allows to set the image size via query param', function () {
      const pipe = {
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

      return exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: ''}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });

    it('allows to set the image width and height via query param', function () {
      const pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(200, 300).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      return exampleProfiles['avatar-image']({
        query: {width: '200', height: '300'},
        headers: {accept: ''}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });
    it('allows to set the image height and square it', function () {
      const pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(300, 300).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      return exampleProfiles['avatar-image']({
        query: {height: '300'},
        headers: {accept: ''}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });

    it('uses client hints dpr to scale images', function () {
      const pipe = {
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

      return exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('uses Math.ceil on hints dpr width', function () {
      const pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').withArgs().returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png').returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(460, 460).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      return exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2.3'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2.3,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('uses client hints width to resize images', function () {
      const pipe = {
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

      return exampleProfiles['avatar-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '1', width: '600'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 1,
          'Content-Type': 'image/png',
          'Vary': 'Width'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('allows to set quality', function () {
      const pipe = {
        rotate: noop,
        toFormat: noop,
        resize: noop,
        min: noop,
        crop: noop
      };
      sinon.stub(pipe, 'rotate').returns(pipe);
      sinon.stub(pipe, 'toFormat').withArgs('png', {quality: 42}).returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(170, 170).returns(pipe);
      sinon.stub(pipe, 'min').withArgs().returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      return exampleProfiles['avatar-image']({
        headers: {accept: ''},
        query: {q: '42'}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });
  });

  describe('preview-image', function () {
    it('uses sane default values', function () {
      const pipe = {
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

      return exampleProfiles['preview-image']({
        headers: {accept: ''},
        query: {}
      }, {
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {

        assert.equal(data.process.length, 1, 'avatar-image has one processor operation');

        data.process[0].pipe(pipe);
      });
    });
    it('clamps dimension to 10..1024', function () {
      const pipe = {
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

      return Promise.props({
        lower: exampleProfiles['preview-image']({
          headers: {accept: ''},
          query: {width: '0'}
        }, {
          DEFAULT_MIME: 'image/png'
        }),
        upper: exampleProfiles['preview-image']({
          headers: {accept: ''},
          query: {width: '2000'}
        }, {
          DEFAULT_MIME: 'image/png'
        })
      }).then(function (data) {
        data.lower.process[0].pipe(pipe);
        data.upper.process[0].pipe(pipe);
      });
    });

    it('uses client hints dpr to scale images', function () {
      const pipe = {
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

      return exampleProfiles['preview-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('uses Math.ceil on hints dpr width', function () {
      const pipe = {
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

      return exampleProfiles['preview-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '2'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 2,
          'Content-Type': 'image/png',
          'Vary': 'DPR'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('uses client hints width to resize images', function () {
      const pipe = {
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

      return exampleProfiles['preview-image']({
        query: {width: '200'},
        headers: {accept: '', dpr: '1', width: '600'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 1,
          'Content-Type': 'image/png',
          'Vary': 'Width'
        });

        data.process[0].pipe(pipe);
      });
    });

    it('allows to set quality', function () {
      const pipe = {
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
      sinon.stub(pipe, 'toFormat').withArgs('png', {quality: 50}).returns(pipe);
      sinon.stub(pipe, 'resize').withArgs(600).returns(pipe);
      sinon.stub(pipe, 'min').returns(pipe);
      sinon.stub(pipe, 'crop').withArgs(sharp.gravity.center).returns(pipe);

      return exampleProfiles['preview-image']({
        query: {q: '50'},
        headers: {accept: '', dpr: '1', width: '600'}
      }, {
        CLIENT_HINTS: true,
        DEFAULT_MIME: 'image/png'
      }).then(function (data) {
        assert.deepEqual(data.response.header, {
          'Accept-CH': 'DPR, Width',
          'Content-DPR': 1,
          'Content-Type': 'image/png',
          'Vary': 'Width'
        });

        data.process[0].pipe(pipe);
      });
    });
  });

});
