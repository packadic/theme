var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('../../');


module.exports = function(config, gruntConfig, builderConfig, grunt ){

    var jsbuild = config.jsbuild;

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
    opts.bootstrapjs[builderConfig.name] = {
        dest: builderConfig.dest + '/assets/scripts/plugins/bootstrap.custom'
    };

    opts.jqueryui[builderConfig.name] =  {
        dest: builderConfig.dest + '/assets/scripts/plugins/jquery-ui.custom'
    };

    opts.shell[builderConfig.name + '_jquery']={
        command: [
            'cd lib/jquery',
            'grunt custom:-' + jsbuild.jquery.join(',-'),
            'cd ../..',
            'cp lib/jquery/dist/* ' + builderConfig.dest + '/assets/scripts/plugins'
        ].join('&&')
    };

    opts.lodash[builderConfig.name] = {
        dest   : builderConfig.dest + '/assets/scripts/plugins/lodash.custom.js',
        options: {
            exports: [ 'amd','commonjs', 'global', 'none' ]
            // lodash-autobuild will add this after analysis of source code
            // include: "names, of, lodash, methods, in, your, source"
        }
    };

    opts.lodashAutobuild[builderConfig.name] = {
        src    : [ 'src/scripts/**/*.js' ],
        options: {
            lodashConfigPath: 'lodash.' + builderConfig.name + '.options.include',
            lodashObjects   : [ '_' ],
            lodashTargets   : [ builderConfig.name ]
        }
    };
    gruntConfig = _.merge(gruntConfig, opts);

    grunt.registerTask(builderConfig.name + ':jsbuild', 'Generates bootstrap, jquery, jquery-ui and lodash with hand picked modules', [
        'bootstrapjs:' + builderConfig.name,
        'jqueryui:' + builderConfig.name,
        'shell:' + builderConfig.name + '_jquery',
        'lodashAutobuild:' + builderConfig.name
    ]);

    return gruntConfig;
};
