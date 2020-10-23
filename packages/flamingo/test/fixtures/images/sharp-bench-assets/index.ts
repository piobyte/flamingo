import path = require("path");

const images: Record<string, string> = {
  jpg: "2569067123_aca715a2ee_o.jpg", // http://www.flickr.com/photos/grizdave/2569067123/
  jpgWithExif: "Landscape_8.jpg", // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_8.jpg
  jpgWithExifMirroring: "Landscape_5.jpg", // https://github.com/recurser/exif-orientation-examples/blob/master/Landscape_5.jpg
  jpgWithGammaHoliness: "gamma_dalai_lama_gray.jpg", // http://www.4p8.com/eric.brasseur/gamma.html
  jpgWithCmykProfile: "Channel_digital_image_CMYK_color.jpg", // http://en.wikipedia.org/wiki/File:Channel_digital_image_CMYK_color.jpg
  jpgWithCmykNoProfile: "Channel_digital_image_CMYK_color_no_profile.jpg",
  jpgWithLowContrast: "low-contrast.jpg", // http://www.flickr.com/photos/grizdave/2569067123/

  png: "50020484-00001.png", // http://c.searspartsdirect.com/lis_png/PLDM/50020484-00001.png
  pngWithTransparency: "blackbug.png", // public domain
  pngWithGreyAlpha: "grey-8bit-alpha.png",
  pngWithOneColor: "2x2_fdcce6.png",
  pngOverlayLayer0: "alpha-layer-0-background.png",
  pngOverlayLayer1: "alpha-layer-1-fill.png",
  pngOverlayLayer2: "alpha-layer-2-ink.png",
  pngOverlayLayer1LowAlpha: "alpha-layer-1-fill-low-alpha.png",
  pngOverlayLayer2LowAlpha: "alpha-layer-2-ink-low-alpha.png",
  pngAlphaPremultiplicationSmall: "alpha-premultiply-1024x768-paper.png",
  pngAlphaPremultiplicationLarge: "alpha-premultiply-2048x1536-paper.png",

  webP: "4.webp", // http://www.gstatic.com/webp/gallery/4.webp
  webPWithTransparency: "5_webp_a.webp", // http://www.gstatic.com/webp/gallery3/5_webp_a.webp
  tiff: "G31D.TIF", // http://www.fileformat.info/format/tiff/sample/e6c9a6e5253348f4aef6d17b534360ab/index.htm
  gif: "Crash_test.gif", // http://upload.wikimedia.org/wikipedia/commons/e/e3/Crash_test.gif
  psd: "free-gearhead-pack.psd", // https://dribbble.com/shots/1624241-Free-Gearhead-Vector-Pack

  svs: "CMU-1-Small-Region.svs", // http://openslide.cs.cmu.edu/download/openslide-testdata/Aperio/CMU-1-Small-Region.svs,

  webpLosslessRoseAlpha: "1_webp_a.webp",
  webpLosslessRose: "1_webp_ll.webp",
  webpLosslessTuxAlpha: "2_webp_a.webp",
  webpLosslessTux: "2_webp_ll.webp",
  webpLosslessDiceAlpha: "3_webp_a.webp",
  webpLosslessDice: "3_webp_ll.webp",
  webpLosslessMendelAlpha: "4_webp_a.webp",
  webpLosslessMendel: "4_webp_ll.webp",
  webpLosslessCompassAlpha: "5_webp_a.webp",
  webpLosslessCompass: "5_webp_ll.webp",

  smallJpeg: "../640px-Saturneclipse.jpg",
  largeJpeg: "../Saturn_from_Cassini_Orbiter_(2004-10-06).jpg",

  smallPdf: "../pdf-sample.pdf",
  largePdf: "../nipguide.pdf",

  heic: "../libheif-assets/example.heic",

  // svg disabled because https://github.com/aheckmann/gm/issues/466
  svg: "Wikimedia-logo.svg", // http://commons.wikimedia.org/wiki/File:Wikimedia-logo.svg
};

export interface ImageDescription {
  desc: string;
  path: string;
  filename: string;
}

function all(): Array<ImageDescription> {
  return Object.keys(images).map((imageName) => ({
    desc: imageName,
    path: path.join(__dirname, images[imageName]),
    filename: images[imageName],
  }));
}

export { all };
