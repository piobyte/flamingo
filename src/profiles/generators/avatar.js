module.exports = function (dimension) {
    return function (RSVP) {
        return new RSVP.Promise(function (resolve) {
            resolve({
                response: {
                    header: {
                        'Content-Type': 'image/jpg'
                    }
                },
                process: [{
                    id: 'format',
                    format: 'jpg'
                }, {
                    id: 'resize',
                    width: dimension,
                    height: dimension
                }, {
                    id: 'compose',
                    operator: 'Copy'
                }, {
                    id: 'gravity',
                    type: 'Center'
                }, {
                    id: 'extent',
                    width: dimension,
                    height: dimension
                }]
            });
        });
    };
};
