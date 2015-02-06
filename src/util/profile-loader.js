var RSVP = require('rsvp'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash-node');

var logger = require('../logger')();

function requireReduceFunction(profilePath){
    return function (obj, fileName) {
        return _.assign(obj, require(profilePath + fileName));
    };
}

/**
 * Function to load profile generation functions from a given directory
 * @param {Object} prevProfiles previous profiles (keys will be overwritten if new profiles have the same name)
 * @param {String} profileDirectoryPath Path to additional profiles
 * @return {Object} Map of all available profiles ({name: function})
 */
exports.loadProfileDirectories = function (prevProfiles, profileDirectoryPath) {
    /*eslint no-sync:0*/
    prevProfiles = prevProfiles || {};

    // load default profiles
    var profiles = _.reduce(fs.readdirSync(path.join(__dirname, '../profiles')), requireReduceFunction('../profiles/'), prevProfiles);

    if (typeof profileDirectoryPath === 'string') {
        // load additional profiles
        profiles = _.reduce(fs.readdirSync(path.normalize(profileDirectoryPath)), requireReduceFunction(profileDirectoryPath + '/'), profiles);
    }

    logger.info('loaded profiles: ' + Object.keys(profiles));

    return profiles;
};

/**
 * Function to load profiles from a file and from a directory
 * @param {String} dir path to profiles dir
 * @return {Object} complete profile map
 */
exports.loadAll = function (dir) {
    return exports.loadProfileDirectories({}, dir);
};

/**
 * Function to build a profile by calling it with some default values
 * @param {Function} profile function that resolves with an array to be used as input for the processor
 * @return {Array} Array of operations for the processor
 */
exports.build = function(profile, query){
    return profile(RSVP, query);
};
