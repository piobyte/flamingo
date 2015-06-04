var os = require('os'),
    cp = require('child_process');

function firstBufferLine(buf) {
    return buf.toString('utf8').split('\n')[0];
}

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
            cpus: os.cpus()
        },
        libs: {
            node: process.versions,
            vips: firstBufferLine(cp.execSync('vips --version')),
            imagemagick: firstBufferLine(cp.execSync('convert -version')),
            gm: firstBufferLine(cp.execSync('gm -version')),
            ffmpeg: firstBufferLine(cp.execSync('ffmpeg -version'))
        }
    };
}

module.exports = fingerprint;
