const WIDTH = 170,
    HEIGHT = WIDTH;

module.exports = function (RSVP) {
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
