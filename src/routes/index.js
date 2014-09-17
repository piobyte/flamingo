var pkg = require('../../package.json');
module.exports = {
    method: 'GET',
    path: '/',
    handler: function (req, reply) {
        reply([
        '<!doctype html><html lang=""><head><title>' + pkg.name + '</title></head><body>',
        '<pre>',
        ' .-.',
        '(-`))' ,
        '  //' ,
        ' //' ,
        '((_.="""=.' ,
        ' \'.   ,.  \'' ,
        '   \'-._,)__\'' ,
        '      |\\   `' ,
        '    __|_\'' ,
        '  ((` |' ,
        '      |' ,
        '    =="-',
        '',
        pkg.name + ' v' + pkg.version,
        pkg.repository.url,
        '</pre>' +
        '</body></html>'].join('\n')
        );
    }
};
