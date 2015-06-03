var pkg = require('../../package.json');

/**
 * Flamingo index route
 * @module flamingo/src/routes/index
 */

/**
 * Function to generate the index route hapi configuration
 * @return {{method: string, path: string, config: {handler: Function}}} hapi route configuration
 * @see http://hapijs.com/api#serverrouteoptions
 * @see GET /
 */
module.exports = function ()/*: {method: string; path: string; config: {handler: function} }*/ {
    return {
        method: 'GET',
        path: '/',
        config: {
            handler: function (req, reply) {
                reply([
                        '<!doctype html><html lang=""><head><title>' + pkg.name + '@' + pkg.version + '</title></head><body>',
                        '<pre>',
                        ' .-.',
                        '(-`))',
                        '  //',
                        ' //',
                        '((_.="""=.',
                        ' \'.   ,.  \'',
                        '   \'-._,)__\'',
                        '      |\\   `',
                        '    __|_\'',
                        '  ((` |',
                        '      |',
                        '    =="-',
                        '',
                        pkg.name + '@' + pkg.version,
                        '<a href="' + pkg.repository.url + '">' + pkg.repository.url + '</a>',
                        '</pre>' +
                        '</body></html>'].join('\n')
                );
            }
        }
    };
};
