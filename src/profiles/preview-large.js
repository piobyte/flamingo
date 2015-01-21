const WIDTH = 200,
    HEIGHT = WIDTH;

module.exports = function (RSVP) {
    return new RSVP.Promise(function (resolve) {
        resolve([{
            id: 'resize',
            width: WIDTH,
            height: HEIGHT + '^'
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
