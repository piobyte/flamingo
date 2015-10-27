'use strict';

var path = require('path');

var images = {

  inputJpg: '2569067123_aca715a2ee_o.jpg', // http://www.flickr.com/photos/grizdave/2569067123/
  inputJpgWithExif: 'Landscape_8.jpg', // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_8.jpg
  inputJpgWithExifMirroring: 'Landscape_5.jpg', // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_5.jpg
  inputJpgWithGammaHoliness: 'gamma_dalai_lama_gray.jpg', // http://www.4p8.com/eric.brasseur/gamma.html
  inputJpgWithCmykProfile: 'Channel_digital_image_CMYK_color.jpg', // http://en.wikipedia.org/wiki/File:Channel_digital_image_CMYK_color.jpg
  inputJpgWithCmykNoProfile: 'Channel_digital_image_CMYK_color_no_profile.jpg',
  inputJpgWithLowContrast: 'low-contrast.jpg', // http://www.flickr.com/photos/grizdave/2569067123/

  inputPng: '50020484-00001.png', // http://c.searspartsdirect.com/lis_png/PLDM/50020484-00001.png
  inputPngWithTransparency: 'blackbug.png', // public domain
  inputPngWithGreyAlpha: 'grey-8bit-alpha.png',
  inputPngWithOneColor: '2x2_fdcce6.png',
  inputPngOverlayLayer0: 'alpha-layer-0-background.png',
  inputPngOverlayLayer1: 'alpha-layer-1-fill.png',
  inputPngOverlayLayer2: 'alpha-layer-2-ink.png',
  inputPngOverlayLayer1LowAlpha: 'alpha-layer-1-fill-low-alpha.png',
  inputPngOverlayLayer2LowAlpha: 'alpha-layer-2-ink-low-alpha.png',
  inputPngAlphaPremultiplicationSmall: 'alpha-premultiply-1024x768-paper.png',
  inputPngAlphaPremultiplicationLarge: 'alpha-premultiply-2048x1536-paper.png',

  inputWebP: '4.webp', // http://www.gstatic.com/webp/gallery/4.webp
  inputWebPWithTransparency: '5_webp_a.webp', // http://www.gstatic.com/webp/gallery3/5_webp_a.webp
  inputTiff: 'G31D.TIF', // http://www.fileformat.info/format/tiff/sample/e6c9a6e5253348f4aef6d17b534360ab/index.htm
  inputGif: 'Crash_test.gif', // http://upload.wikimedia.org/wikipedia/commons/e/e3/Crash_test.gif
  inputSvg: 'Wikimedia-logo.svg', // http://commons.wikimedia.org/wiki/File:Wikimedia-logo.svg
  inputPsd: 'free-gearhead-pack.psd', // https://dribbble.com/shots/1624241-Free-Gearhead-Vector-Pack

  inputSvs: 'CMU-1-Small-Region.svs', // http://openslide.cs.cmu.edu/download/openslide-testdata/Aperio/CMU-1-Small-Region.svs,

  webpLosslessRoseAlpha: '1_webp_a.webp',
  webpLosslessRose: '1_webp_ll.webp',
  webpLosslessTuxAlpha: '2_webp_a.webp',
  webpLosslessTux: '2_webp_ll.webp',
  webpLosslessDiceAlpha: '3_webp_a.webp',
  webpLosslessDice: '3_webp_ll.webp',
  webpLosslessMendelAlpha: '4_webp_a.webp',
  webpLosslessMendel: '4_webp_ll.webp',
  webpLosslessCompassAlpha: '5_webp_a.webp',
  webpLosslessCompass: '5_webp_ll.webp',

  smallJpeg: '../640px-Saturneclipse.jpg',
  largeJpeg: '../Saturn_from_Cassini_Orbiter_(2004-10-06).jpg'
};

exports.all = function () {
  return Object.keys(images).map(function (imageName) {
    return {
      desc: imageName,
      path: path.join(__dirname, images[imageName]),
      filename: images[imageName]
    };
  });
};
