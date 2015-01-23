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
 * Function to check if a given string ends with a given string
 * @param {String} string String to check for ending substring
 * @param {String} end Possible ending string
 * @return {boolean} if the string ends with the end string
 */
function endsWith(string, end) {
    return string.indexOf(end) === string.length - end.length;
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
    var profiles = _.reduce(fs.readdirSync(path.join(__dirname, '../profiles/files')), requireReduceFunction('../profiles/files/'), prevProfiles);

    if (typeof profileDirectoryPath === 'string' && endsWith(profileDirectoryPath, '.js')) {
        // load additional profiles
        profiles = _.reduce(fs.readdirSync(path.normalize(profileDirectoryPath)), requireReduceFunction(profileDirectoryPath + '/'), profiles);
    }

    logger.info('loaded profiles: ' + Object.keys(profiles));

    return profiles;
};

exports.loadProfileFile = function (prevProfiles, filePath) {
    prevProfiles = prevProfiles || {};

    // load default profiles
    var profiles = _.assign(prevProfiles, require('../profiles/inline'));

    if (typeof filePath === 'string' && endsWith(filePath, '.js')) {
        // load additional profiles
        profiles = _.assign(prevProfiles, require(path.normalize(filePath)));
    }

    logger.info('loaded profiles: ' + Object.keys(profiles));

    return profiles;
};

/**
 * Function to load profiles from a file and from a directory
 * @param {String} file path to profiles file
 * @param {String} dir path to profiles dir
 * @return {Object} complete profile map
 */
exports.loadAll = function (file, dir) {
    return exports.loadProfileFile(exports.loadProfileDirectories({}, dir), file);
};

/**
 * Function to build a profile by calling it with some default values
 * @param {Function} profile function that resolves with an array to be used as input for the processor
 * @return {Array} Array of operations for the processor
 */
exports.build = function(profile){
    return profile(RSVP);
};
