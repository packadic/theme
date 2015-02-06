var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../');


module.exports = function( config, grunt, target, dir ){
    target = target || 'dev';
    dir = dir || 'dev';

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
                dir: 'src/vendor/bootstrap/js',
                use: ['transition', 'collapse', 'dropdown', 'modal', 'tooltip', 'popover', 'tab'],
                minify: false
            }
        },
        jqueryui: {
            options: {
                dir: 'src/vendor/jquery-ui/ui',
                use: ['widget'],
                minify: false
            }
        }
    };
    opts.bootstrapjs[target] = {
        dest: dir + '/assets/vendor/bootstrap.custom'
    };

    opts.jqueryui[target] =  {
        dest: dir + '/assets/vendor/jquery-ui.custom'
    };

    opts.shell[target + '_jquery']={
        command: [
            'cd lib/jquery',
            'grunt custom:-deprecated,-ajax,-effects',
            'cd ../..',
            'cp lib/jquery/dist/* ' + dir + '/assets/vendor',
        ].join('&&')
    };

    opts.lodash[target] = {
        dest   : dir + '/assets/vendor/lodash.custom.js',
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


    grunt.registerTask(target + ':jsbuild', [
        'bootstrapjs:' + target,
        'jqueryui:' + target,
        'shell:' + target + '_jquery',
        'lodashAutobuild:' + target
    ]);

    return config;
};
