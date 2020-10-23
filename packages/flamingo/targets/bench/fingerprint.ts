import os = require("os");
import sharp = require("sharp");

function fingerprint() {
  /* eslint no-sync: 0 */
  return {
    os: {
      type: os.type(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus(),
    },
    libs: {
      node: process.versions,
      vips: sharp.versions.vips,
    },
  };
}

export = fingerprint;
