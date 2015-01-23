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
        '<a href="' + pkg.repository.url + '">' + pkg.repository.url + '</a>',
        '</pre>' +
        '</body></html>'].join('\n')
        );
    }
};
