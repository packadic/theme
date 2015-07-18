var util = require('util'),

    _       = require('lodash'),
    jsyaml  = require('js-yaml'),
    fse     = require('fs-extra'),
    fs      = require('fs'),
    globule = require('globule'),
    path    = require('path');



function log() {
    _.toArray(arguments).forEach(function (vl) {
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function dd() {
    log.apply(log, _.toArray(arguments));
    process.exit()
}


module.exports = function (grunt) {

    grunt.registerTask('create_init_script', 'Creates the init.js script. run AFTER jsbuild and AFTER copy:scripts', function () {
        grunt.event.emit('task.start', 'create_init_bootscript');
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;

        var target = grunt.config.get('target');
        var dest = target.dest;
        var destInitJs = path.join(cwd, dest, 'assets/scripts/init.js');

        var readScript = function (filePath) {
            return fs.readFileSync(path.join(cwd, dest, 'assets/scripts', filePath), 'UTF-8');
        };

        var initJsContent = fs.readFileSync(path.join(cwd, 'src/scripts/init.js'), 'UTF-8');
        if ( fs.existsSync(destInitJs) ) {
            fs.unlinkSync(destInitJs);
        }

        grunt.log.writeln('trying to read from ' + path.join(cwd, dest, 'assets/scripts'));

        var prependScripts = grunt.config('init_script.prepend_scripts');
        var appendScripts = grunt.config('init_script.append_scripts');
        var initScript = '';
        prependScripts.forEach(function (scriptPath) {
            initScript += " \n ; " + readScript(scriptPath);

        });
        initScript += " \n ; " + initJsContent;
        appendScripts.forEach(function (scriptPath) {
            initScript += " \n ; " + readScript(scriptPath);
        });

        var destPath = destInitJs;
        grunt.log.writeln('trying to write to ' + destPath);
        fs.writeFileSync(destPath, initScript);



        grunt.event.emit('task.done', 'create_init_bootscript', self);
        ok('Created init script at: ' + destPath);
        taskDone();
    });

};
