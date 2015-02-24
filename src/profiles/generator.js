var clamp = function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    parseFieldNaN = function (object, field, nanDefault) {
        var result = nanDefault;
        if(object.hasOwnProperty(field)) {
            var objValue = parseInt(object[field], 10);
            if (!isNaN(objValue)) {
                 result = objValue;
            }
        }
        return result;
    },
    avatarGenerator = function (dimension) {
        return function (RSVP, query) {
            return new RSVP.Promise(function (resolve) {
                // override dimension with query.width
                dimension = parseFieldNaN(query, 'width', dimension);
                dimension = clamp(dimension, 10, 1024);

                resolve({
                    response: { header: { 'Content-Type': 'image/png' }},
                    process: [
                        { id: 'autoOrient' },
                        { id: 'format', format: 'png' },
                        { id: 'resize', width: dimension, height: dimension + '^' },
                        { id: 'gravity', type: 'Center' },
                        { id: 'extent', width: dimension, height: dimension }
                    ]
                });
            });
        };
    },
    previewGenerator = function (dimension) {
        return function (RSVP, query) {
            return new RSVP.Promise(function (resolve) {
                // override dimension with query.width
                dimension = parseFieldNaN(query, 'width', dimension);
                dimension = clamp(dimension, 10, 1024);

                resolve({
                    response: { header: { 'Content-Type': 'image/jpg' }},
                    process: [
                        { id: 'autoOrient' },
                        { id: 'background', color: 'white' },
                        { id: 'format', format: 'jpg' },
                        { id: 'resize', width: dimension, height: dimension + '^' },
                        { id: 'gravity', type: 'Center' },
                        { id: 'extent', width: dimension, height: dimension }
                    ]
                });
            });
        };
    };

var profiles = {
    avatar: [
        ['image', 170, avatarGenerator]
    ],
    preview: [
        ['image', 200, previewGenerator]
    ]
};

/**
 * Recursive generation of profiles
 * Useful for generating a profile name by hierarchical combining object property names:
 * android: [preview: [['mdpi', 64, fn]]] -> {android-preview-mdpi: fn}
 * @param {String} prefix path  prefix
 * @param {Object} object Objects to traverse
 * @param {Object} all resulting object
 * @return {Object} Object containing key: profile name, value: profile generator function
 */
function buildProfiles(prefix, object, all) {
    Object.keys(object).forEach(function (key) {
        if (/* isArray(object[key] */object[key].constructor === Array) {
            object[key].forEach(function (item) {
                all[(prefix.length ? prefix + '-' : '') + key + '-' + item[0]] = item[2](item[1]);
            });
        } else if (/* isPlainObject(object[key] */Object.prototype.toString.call(object[key]) === '[object Object]') {
            all = buildProfiles(prefix + key, object[key], all);
        }
    });
    return all;
}

module.exports = buildProfiles('', profiles, {});
