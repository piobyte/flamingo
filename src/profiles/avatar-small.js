var RSVP = require('rsvp');

const WIDTH = 50,
    HEIGHT = WIDTH;

module.exports = function () {
    return new RSVP.Promise(function (resolve) {
        resolve([{
            id: 'resize',
            width: WIDTH,
            height: HEIGHT
        },{
            id: 'compose',
            operator: 'Copy'
        },{
            id: 'gravity',
            type: 'Center'
        },{
            id: 'extent',
            width: WIDTH,
            height: HEIGHT
        }]);
    });
};
