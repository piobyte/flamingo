var pkg = require('../../package.json');

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
