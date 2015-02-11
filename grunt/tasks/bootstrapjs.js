var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../');


module.exports = function( grunt ){

    grunt.registerMultiTask('bootstrapjs', 'bootstrapjs.', function(){
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options({
            dir   : 'src/vendor/bootstrap/js',
            use   : [ 'transition', 'collapse', 'dropdown', 'modal', 'tooltip', 'popover', 'tab' ],
            minify: false
        });

        var files = [
            'transition',
            'alert',
            'button',
            'carousel',
            'collapse',
            'dropdown',
            'modal',
            'tooltip',
            'popover',
            'scrollspy',
            'tab',
            'affix'
        ];


        var source = '';
        options.use.forEach(function( name ){
            grunt.log.writeln('added ' + name);
            source += fs.readFileSync(path.resolve(cwd, options.dir, name + '.js'), 'utf-8') + "\n";
        });
        var outpath = path.resolve(cwd, this.data.dest + '.js');
        var outminpath = path.resolve(cwd, this.data.dest + '.min.js');

        fs.outputFileSync(outpath, source);
        ok('written ' + outpath);
        var uglify = require('uglify-js');
        fs.outputFileSync(outminpath, uglify.minify(outpath).code);
        ok('written ' + outminpath);

        taskDone();
    });
};
