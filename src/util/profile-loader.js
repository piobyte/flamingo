var RSVP = require('rsvp'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash-node');

var logger = require('../logger')();

function requireReduceFunction(profilePath){
    return function (obj, fileName) {
        obj[fileName.replace(/\.js$/, '')] = require(profilePath + fileName);
        return obj;
    };
}

/**
 * Function to load profile generation functions from a given directory
 * @param {String} profilePath Path to additional profiles
 * @return {Object} Map of all available profiles ({name: function})
 */
exports.load = function (profilePath) {
    /*eslint no-sync:0*/

    // load default profiles
    var profiles = _.reduce(fs.readdirSync(path.join(__dirname, '../profiles')), requireReduceFunction('../profiles/'), {});

    if (typeof profilePath === 'string') {
        // load additional profiles
        profiles = _.reduce(fs.readdirSync(path.normalize(profilePath)), requireReduceFunction(profilePath + '/'), profiles);
    }

    logger.info('loaded profiles: ' + Object.keys(profiles));

    return profiles;
};

/**
 * Function to build a profile by calling it with some default values
 * @param {Function} profile function that resolves with an array to be used as input for the processor
 * @return {Array} Array of operations for the processor
 */
exports.build = function(profile){
    return profile(RSVP);
};
