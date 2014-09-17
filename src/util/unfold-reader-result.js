var RSVP = require('rsvp');

module.exports = function (readerResult) {
    return readerResult.stream();
};
