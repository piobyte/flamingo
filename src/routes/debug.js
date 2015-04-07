var pkg = require('../../package.json'),
    RSVP = require('rsvp'),
    conf = require('../../config'),
    _ = require('lodash'),
    template = require('lodash/string/template');

/*eslint no-sync:0 */
var URLS,
    HOST = 'http://localhost:4000',
    htmlTemplate = template(require('fs').readFileSync(__dirname + '/debug-template.html')),
    PLAIN_URLS = [
        '/w3c_home.bmp',
        '/w3c_home.jpg',
        '/w3c_home_2.bmp',
        '/w3c_home_2.jpg',
        '/w3c_home_256.bmp',
        '/w3c_home_256.jpg',
        '/w3c_home_animation.gif',
        '/w3c_home_gray.bmp',
        '/w3c_home_gray.jpg',
        '/w3c_home.gif',
        '/w3c_home.png',
        '/w3c_home_2.gif',
        '/w3c_home_2.png',
        '/w3c_home_256.gif',
        '/w3c_home_256.png',
        '/w3c_home_animation.mng',
        '/w3c_home_gray.gif',
        '/w3c_home_gray.png',

        // via http://wiesmann.codiferes.net/share/bitmaps/
        '/test_pattern.xbm',
        '/test_pattern1.png',
        '/test_pattern8.png',
        '/test_pattern.gif',
        '/test_pattern.webp',
        '/test_pattern.jpg',
        '/test_pattern.png',
        '/test_pattern.pdf',
        '/test_pattern.svg',
        '/test_pattern1.tif',
        '/test_pattern8.tif',
        '/test_pattern.jp2',
        '/test_pattern.sgi',
        '/test_pattern.psd',
        '/test_pattern.tga',
        '/test_pattern.bmp',
        '/test_pattern.tif'

        //'/Gran-Turismo-6_2013_05-15-13_108.jpg',
        //'/Tux.png',
        //'/ghibli_orig.jpg',
        //'/app-icon.png',
        //'/animated.gif',
        //'/Testing_ToneValueDifferentiation-en.tif',
        //
        //'/exif-orientation-examples/Portrait_1.jpg',
        //'/exif-orientation-examples/Portrait_2.jpg',
        //'/exif-orientation-examples/Portrait_3.jpg',
        //'/exif-orientation-examples/Portrait_4.jpg',
        //'/exif-orientation-examples/Portrait_5.jpg',
        //'/exif-orientation-examples/Portrait_6.jpg',
        //'/exif-orientation-examples/Portrait_7.jpg',
        //'/exif-orientation-examples/Portrait_8.jpg',
        //'/exif-orientation-examples/Landscape_1.jpg',
        //'/exif-orientation-examples/Landscape_2.jpg',
        //'/exif-orientation-examples/Landscape_3.jpg',
        //'/exif-orientation-examples/Landscape_4.jpg',
        //'/exif-orientation-examples/Landscape_5.jpg',
        //'/exif-orientation-examples/Landscape_6.jpg',
        //'/exif-orientation-examples/Landscape_7.jpg',
        //'/exif-orientation-examples/Landscape_8.jpg'
    ].map(function (path) { return HOST + path; });

RSVP.all(
    /*eslint new-cap: 0*/
    PLAIN_URLS.map(function (url) { return conf.ENCODE_PAYLOAD(url); })
).then(function (urls) {
    URLS = urls.map(function (url) {
        return encodeURIComponent(url);
    });
});

module.exports = function (flamingo) {
    return {
        method: 'GET',
        path: '/debug',
        handler: function (req, reply) {
            var profileNames = Object.keys(flamingo.profiles),
                base = '/',
                processors = ['vips', 'gm'];

            profileNames = profileNames.filter(function (name) {
                // only use debug routes
                return name.indexOf('debug-') === 0;
            });

            if (req.query.profiles) {
                profileNames = req.query.profiles.split(',');
            }
            if (req.query.processors) {
                processors = req.query.processors.split(',');
            }

            reply(htmlTemplate({
                _: require('lodash'),
                pkg: pkg,
                profileNames: profileNames,
                urls: URLS,
                plainUrls: PLAIN_URLS,
                debugs: [],
                sizes: _.range(50, 250, 100),
                base: base,
                processors: processors
            }));
        }
    };
};
