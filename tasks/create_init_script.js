var radic  = require('radic'),
    util   = radic.util,
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fse     = require('fs-extra'),
    fs     = require('fs-extra'),
    globule       = require('globule'),
    path   = require('path');



function log(){
    _.toArray(arguments).forEach(function( vl ){
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function dd(){
    log.apply(log, _.toArray(arguments));
    process.exit()
}


module.exports = function( grunt ){

    grunt.registerTask('create_init_script', 'Creates the init.js script. run AFTER jsbuild and AFTER copy:scripts', function(){
        grunt.event.emit('task.start', 'create_init_bootscript');
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;

        this.requires('jsbuild', 'copy:scripts');

        var target = grunt.config.get('target');
        var dest = target.dest;
        var readScript = function(filePath){
            return fs.readFileSync(path.join(cwd, dest, 'assets/scripts', filePath), 'UTF-8');
        };

        var initScript = '';
        initScript += " \n ; " + readScript('plugins/lodash.custom.min.js');
        initScript += " \n ; " + readScript('plugins/require.js');
        initScript += " \n ; " + readScript('init.js');

        var destPath = path.join(cwd, dest, 'assets/scripts/init.js');
        fs.writeFileSync(destPath, initScript);


        grunt.event.emit('task.done', 'create_init_bootscript', self);
        ok('Created init script at: ' + destPath);
        taskDone();
    });

};