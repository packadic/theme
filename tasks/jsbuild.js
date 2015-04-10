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

    // @todo optimize jsbuild/bootstrapjs/jqueryui into 1 multitask
    grunt.registerTask('jsbuild', 'Generates customized javascript libraries (lodash, bootstrap, jquery, jquery-ui)', function(target){
        grunt.event.emit('task.start', 'jsbuild');
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;

        this.requiresConfig('jsbuild');

        var name = grunt.config.get('target.name');
        var jsbuild = grunt.config.get('jsbuild');
        log(name);
        var opts = {
            // grunt-lodash configuration
            lodash         : {
            },
            lodashAutobuild: {
                // Multiple autobuild targets supported
            },
            shell: {

            },
            bootstrapjs    : {
                options: {
                    dir: 'src/plugins/bootstrap/js',
                    use: jsbuild.bootstrap,
                    minify: false
                }
            },
            jqueryui: {
                options: {
                    dir: 'src/plugins/jquery-ui/ui',
                    use: jsbuild.jqueryui,
                    minify: false
                }
            }
        };
        opts.bootstrapjs[name] = {
            dest: '<%= target.dest %>/assets/scripts/plugins/bootstrap.custom'
        };

        opts.jqueryui[name] =  {
            dest: '<%= target.dest %>/assets/scripts/plugins/jquery-ui.custom'
        };

        opts.shell[name + '_jquery']={
            command: [
                'cd lib/jquery',
                'npm install',
                'grunt custom:-' + jsbuild.jquery.join(',-'),
                'cd ../..',
                'cp lib/jquery/dist/* <%= target.dest %>/assets/scripts/plugins'
            ].join('&&')
        };

        opts.lodash[name] = {
            dest   : '<%= target.dest %>/assets/scripts/plugins/lodash.custom.js',
            options: {
                exports: [ 'amd','commonjs', 'global', 'none' ]
                // lodash-autobuild will add this after analysis of source code
                // include: "names, of, lodash, methods, in, your, source"
            }
        };

        opts.lodashAutobuild[name] = {
            src    : [ 'src/scripts/**/*.js', 'src/plugins/github-api/github.js' ],
            options: {
                lodashConfigPath: 'lodash.' + name + '.options.include',
                lodashObjects   : [ '_' ],
                lodashTargets   : [ name ]
            }
        };

        grunt.initConfig( _.merge(grunt.config.get(), opts));

        var map = {
            bootstrap: 'bootstrapjs:' + name,
            jqueryui: 'jqueryui:' + name,
            jquery: 'shell:' + name + '_jquery',
            lodash: 'lodashAutobuild:' + name
        };
        if(target){
            grunt.task.run(map[target])
        } else {
            grunt.task.run(_.values(map));
        }

        grunt.event.emit('task.done', 'jsbuild', target);
        taskDone();
    });

};
