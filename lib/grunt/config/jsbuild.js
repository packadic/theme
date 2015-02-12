var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../index');


module.exports = function(grunt ){

    var name = grunt.config.get('builder.name');
    var jsbuild = grunt.config.get('config.jsbuild');

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
        dest: '<%= builder.dest %>/assets/scripts/plugins/bootstrap.custom'
    };

    opts.jqueryui[name] =  {
        dest: '<%= builder.dest %>/assets/scripts/plugins/jquery-ui.custom'
    };

    opts.shell[name + '_jquery']={
        command: [
            'cd lib/jquery',
            'grunt custom:-' + jsbuild.jquery.join(',-'),
            'cd ../..',
            'cp lib/jquery/dist/* <%= builder.dest %>/assets/scripts/plugins'
        ].join('&&')
    };

    opts.lodash[name] = {
        dest   : '<%= builder.dest %>/assets/scripts/plugins/lodash.custom.js',
        options: {
            exports: [ 'amd','commonjs', 'global', 'none' ]
            // lodash-autobuild will add this after analysis of source code
            // include: "names, of, lodash, methods, in, your, source"
        }
    };

    opts.lodashAutobuild[name] = {
        src    : [ 'src/scripts/**/*.js' ],
        options: {
            lodashConfigPath: 'lodash.' + name + '.options.include',
            lodashObjects   : [ '_' ],
            lodashTargets   : [ name ]
        }
    };
    grunt.config.merge( opts);
    grunt.registerTask(name + ':jsbuild', 'Generates bootstrap, jquery, jquery-ui and lodash with hand picked modules', [
        'bootstrapjs:' + name,
        'jqueryui:' + name,
        'shell:' + name + '_jquery',
        'lodashAutobuild:' + name
    ]);

    return grunt;
};
