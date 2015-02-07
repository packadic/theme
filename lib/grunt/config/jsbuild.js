var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../');


module.exports = function( config, grunt, target, dir ){
    target = target || 'dev';
    dir = dir || 'dev';

    var jsbuild = config.config.jsbuild;

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
    opts.bootstrapjs[target] = {
        dest: dir + '/assets/scripts/plugins/bootstrap.custom'
    };

    opts.jqueryui[target] =  {
        dest: dir + '/assets/scripts/plugins/jquery-ui.custom'
    };

    opts.shell[target + '_jquery']={
        command: [
            'cd lib/jquery',
            'grunt custom:-' + jsbuild.jquery.join(',-'),
            'cd ../..',
            'cp lib/jquery/dist/* ' + dir + '/assets/scripts/plugins'
        ].join('&&')
    };

    opts.lodash[target] = {
        dest   : dir + '/assets/scripts/plugins/lodash.custom.js',
        options: {
            exports: [ 'amd','commonjs', 'global', 'none' ]
            // lodash-autobuild will add this after analysis of source code
            // include: "names, of, lodash, methods, in, your, source"
        }
    };

    opts.lodashAutobuild[target] = {
        // The path to your source file(s)
        src    : [ 'src/scripts/**/*.js' ],
        // Default options:
        options: {
            // Set to the configured lodash task options.include
            lodashConfigPath: 'lodash.' + target + '.options.include',
            // The name(s) of the lodash object(s)
            lodashObjects   : [ '_' ],
            // Undefined lodashTargets or an empty targets
            // array will run all lodash targets. Specify
            // targets by name to run specific targets
            lodashTargets   : [ target ]
        }
    };
    config = _.merge(config, opts);


    grunt.registerTask(target + ':jsbuild', 'Generates bootstrap, jquery, jquery-ui and lodash with hand picked modules', [
        'bootstrapjs:' + target,
        'jqueryui:' + target,
        'shell:' + target + '_jquery',
        'lodashAutobuild:' + target
    ]);

    return config;
};
