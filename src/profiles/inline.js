var avatarGenerator = require('./generators/avatar'),
    previewGenerator = require('./generators/preview'),
    _ = require('lodash-node');

var profiles = {
        avatar: [
            ['large', 170, avatarGenerator],
            ['small', 100, avatarGenerator],
            ['tiny',  40,  avatarGenerator]
        ],
        preview: [
            ['large', 200, previewGenerator]
        ],
        android: {
            avatar: [
                ['mdpi',    40,  avatarGenerator],
                ['hdpi',    60,  avatarGenerator],
                ['xhdpi',   80,  avatarGenerator],
                ['xxhdpi',  120, avatarGenerator],
                ['xxxhdpi', 160, avatarGenerator]
            ],
            me: [
                ['mdpi',    64,  avatarGenerator],
                ['hdpi',    96,  avatarGenerator],
                ['xhdpi',   128, avatarGenerator],
                ['xxhdpi',  192, avatarGenerator],
                ['xxxhdpi', 256, avatarGenerator]
            ],
            preview: [
                ['mdpi',    192, previewGenerator],
                ['hdpi',    288, previewGenerator],
                ['xhdpi',   384, previewGenerator],
                ['xxhdpi',  576, previewGenerator],
                ['xxxhdpi', 768, previewGenerator]
            ]
        }
    };

/**
 * Recursive generation of profiles
 * @param {String} prefix path  prefix
 * @param {Object} object Objects to traverse
 * @param {Object} all resulting object
 * @return {Object} Object containing key: profile name, value: profile generator function
 */
function buildProfiles(prefix, object, all) {
    Object.keys(object).forEach(function (key) {
        if (_.isArray(object[key])) {
            object[key].forEach(function (item) {
                all[(prefix.length ? prefix + '-' : '') + key + '-' + item[0]] = item[2](item[1]);
            });
        } else if (_.isPlainObject(object[key])) {
            all = buildProfiles(prefix + key, object[key], all);
        }
    });
    return all;
}

module.exports = buildProfiles('', profiles, {});
