var pkg = require('../../package.json'),
    RSVP = require('rsvp'),
    conf = require('../../config'),
    _ = require('lodash'),
    template = require('lodash/string/template');

/*eslint no-sync:0 */
var URLS,
    HOST = 'http://localhost:4000',
    htmlTemplate = template(require('fs').readFileSync(__dirname + '/debug-template.html'));

RSVP.all([
    /*eslint new-cap: 0*/
    conf.ENCODE_PAYLOAD(HOST + '/Gran-Turismo-6_2013_05-15-13_108.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/Tux.png'),
    conf.ENCODE_PAYLOAD(HOST + '/ghibli_orig.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/app-icon.png'),
    conf.ENCODE_PAYLOAD(HOST + '/animated.gif'),

    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_1.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_2.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_3.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_4.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_5.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_6.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_7.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Portrait_8.jpg'),

    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_1.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_2.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_3.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_4.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_5.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_6.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_7.jpg'),
    conf.ENCODE_PAYLOAD(HOST + '/exif-orientation-examples/Landscape_8.jpg')
]).then(function (urls) {
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
                debugs: [],
                sizes: _.range(50, 250, 100),
                base: base,
                processors: processors
            }));
        }
    };
};
