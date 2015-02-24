var RSVP = require('rsvp'),
    gm = require('gm');

const BITS = {
    FLIP_HORIZONTAL: 1, // 0001
    FLIP_VERTICALLY: 2  // 0010
};

var processes = {
    autoOrient: function (graphics) {
        graphics = graphics.autoOrient();
        return graphics;
    },
    format: function (graphics, opts) {
        graphics = graphics.setFormat(opts.format);
        return graphics;
    },
    compose: function (graphics, opts) {
        graphics = graphics.compose(opts.operator);
        return graphics;
    },
    background: function (graphics, opts) {
        graphics = graphics.background(opts.color);
        return graphics;
    },
    gravity: function (graphics, opts) {
        graphics = graphics.gravity(opts.type);
        return graphics;
    },
    crop: function (graphics, opts) {
        graphics = graphics.crop(opts.x, opts.y, opts.width, opts.height);
        return graphics;
    },
    extent: function (graphics, opts) {
        graphics = graphics.extent(opts.width, opts.height, opts.options);
        return graphics;
    },
    scale: function (graphics, opts) {
        graphics = graphics.scale(opts.width, opts.height);
        return graphics;
    },
    resize: function (graphics, opts) {
        graphics = graphics.resize(opts.width, opts.height, opts.options);
        return graphics;
    },
    rotate: function (graphics, opts) {
        graphics = graphics.rotate('black', opts.degrees);
        return graphics;
    },
    flip: function (graphics, opts) {
        /* eslint no-bitwise: 0 */
        var flipBit = opts.bit;
        if (flipBit & BITS.FLIP_HORIZONTAL) {
            graphics = graphics.flop();
        }
        if (flipBit & BITS.FLIP_VERTICALLY) {
            graphics = graphics.flip();
        }
        return graphics;

    }
};

module.exports = function (processQueue) {
    return function (inputStream) {
        return new RSVP.Promise(function (resolve) {
            var graphics = gm(inputStream);

            processQueue.forEach(function (processItem) {
                var processFn = processes[processItem.id];
                if (processFn) {
                    graphics = processFn(graphics, processItem);
                }
            });

            resolve(graphics.stream());
        });
    };
};
