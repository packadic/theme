/* jshint camelcase: false */

'use strict';

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    lib    = require('./lib');


var init = module.exports = function( grunt, builderName ){
    var ok = grunt.log.ok;

    builderName = builderName || 'base';

    //grunt.log.writeflags([grunt.option('target')]);
    // load global configuration and get selected builder configuration to include in the grunt config
    var config = grunt.file.readYAML('config.yml');
    var builders = _.keys(config.builders);
    var builderConfig = grunt.file.readYAML('grunt/builders/' + builderName + '.yml');
    builderConfig = _.merge(builderConfig, config.builders[ builderName ]); // override default builderConfig with the selected builder config in config.yml
    //var builderConfig = config.builders[ builder ];
    builderConfig.name = builderName;
    builderConfig.type = grunt.option('target') || builderConfig.type

    //grunt.log.writeflags(builderConfig);

    var jadeFilters = {
        code: function( block ){
            return block
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/#/g, '&#35;')
                .replace(/\\/g, '\\\\');
        }
    };
    var gruntConfig = {
        config          : builderConfig,
        clean           : {
            all      : {src: '<%= config.dest %>/*'},
            assets   : {src: '<%= config.dest %>/assets'},
            fonts    : {src: '<%= config.dest %>/assets/fonts'},
            images   : {src: '<%= config.dest %>/assets/images'},
            styles   : {src: '<%= config.dest %>/assets/styles'},
            plugins  : {src: '<%= config.dest %>/assets/scripts/plugins'},
            templates: {src: '<%= config.dest %>/assets/scripts/templates'},
            demo     : {src: '<%= config.dest %>/demo'},
            views    : {src: '<%= config.dest %>/**/*.html'}
        },
        copy            : {
            fonts  : {
                files: [
                    {expand: true, cwd: 'src/plugins/bootstrap/fonts', src: '**', dest: '<%= config.dest %>/assets/fonts'},
                    {expand: true, cwd: 'src/plugins/font-awesome/fonts', src: '**', dest: '<%= config.dest %>/assets/fonts'}
                ]
            },
            images : {files: [ {expand: true, cwd: 'src/images', src: '**', dest: '<%= config.dest %>/assets/images'} ]},
            scripts: {files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: '<%= config.dest %>/assets/scripts'} ]},
            plugins: {files: [ {expand: true, cwd: 'src/plugins', src: '**', dest: '<%= config.dest %>/assets/scripts/plugins'} ]},
            demo   : {files: [ {expand: true, cwd: 'src/demo', src: '**', dest: '<%= config.dest %>/demo'} ]},
            misc   : {files: [ {src: 'src/.htaccess', dest: '<%= config.dest %>/.htaccess'} ]}
        },
        jade            : {
            dev      : {
                options: {data: lib.getJadeData(builderConfig.type), filters: jadeFilters, pretty: true},
                files  : [ {expand: true, cwd: 'src/views/pages', src: [ '**/*.jade', '!plugins/**' ], ext: '.html', dest: '<%= config.dest %>'} ]
            },
            dist     : {
                options: {data: lib.getJadeData(builderConfig.type), filters: jadeFilters, pretty: false},
                files  : [ {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: '<%= config.dest %>'} ]
            },
            templates: {
                options: {
                    client   : true,
                    pretty   : false,
                    amd      : true,
                    namespace: false
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: '<%= config.dest %>/assets/scripts/templates'}
                ]
            }
        },
        'string-replace': {
            templates: {
                files  : {'<%= config.dest %>/assets/scripts/templates/': '<%= config.dest %>/assets/scripts/templates/**'},
                options: {
                    replacements: [ {pattern: 'src/views/tpls/', replacement: ''} ]
                }
            }
        },
        sass            : {
            options: {sourcemap: 'none', compass: true},
            dev    : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= config.dest %>/assets/styles'} ]
            },
            dist   : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= config.dest %>/assets/styles'} ]
            }
        },
        uglify          : {
            dev: {
                options: {sourceMap: true, compress: false, beautify: true, gzip: true, preserveComments: 'all'},
                files  : {
                    '<%= config.dest %>/assets/scripts/plugins/modernizr.js' : [ 'src/plugins/modernizr/modernizr.js' ],
                    '<%= config.dest %>/assets/scripts/plugins/bootbox.js'   : [ 'src/plugins/bootbox/bootbox.js' ],
                    '<%= config.dest %>/assets/scripts/plugins/mscrollbar.js': [ 'src/plugins/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    '<%= config.dest %>/assets/scripts/plugins/require.js'   : [ 'src/plugins/requirejs/require.js' ]
                }
            }
        },
        bootlint        : {
            options: {
                stoponerror: false,
                relaxerror : [
                    'E003', // Row not in .container error - Ignore because the .container is included in #page-wrapper scss
                    'W005' // Unable to find jQuery - Ignore because of require.js usage its not detected
                ]
            },
            files  : [ '<%= config.dest %>/*/*.html', '<%= config.dest %>/*.html' ]
        },
        changelog       : {
            make: {
                options: {
                    logArguments: [ '--pretty=[%ad](https://github.com/packadic/theme/commit/%H): %s', '--no-merges', '--date=short' ],
                    dest        : 'CHANGELOG.md',
                    template    : '\n\n{{> features}}',
                    after       : 'v0.1.0',
                    fileHeader  : '# Changelog',
                    featureRegex: /^(.*)$/gim,
                    partials    : {
                        features: '{{#if features}}{{#each features}}{{> feature}}{{/each}}{{else}}{{> empty}}{{/if}}\n',
                        feature : '- {{this}}  \n'
                    }
                }
            }
        },
        watch           : {
            options: {livereload: true, nospawn: true}
        },
        availabletasks  : {
            tasks: {
                options: {}
            }
        },
        frontmatter: {
            dev: {
                files: {
                    src: ['<%= config.dest %>/**/*.html', '!<%= config.dest %>/assets/**']
                }
            }
        }
    };

    grunt.loadTasks('grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);


    var builder = require('./grunt/builders/' + builderName)(builderConfig, grunt);
    var renames = {
        BNAME: builderConfig.name,
        BTYPE: builderConfig.type,
        BDEST: builderConfig.dest
    };
    builder.tasks = lib.replaceObjectArrayValueByMap(builder.tasks, renames);

    gruntConfig.availabletasks.tasks.options = {
        filter  : 'include',
        tasks   : [ 'tasks' ].concat(lib.replaceArrayByMap(builder.availabletasks.tasks, renames)),
        reporter: lib.getAvailableTaskReporter(builder.availabletasks.reporterOptions)
    };
    //builder.watchers = lib.arrayReplace(builder.watchers, builderReplacerMap);
    // Configure watchers
    var watchers = {
        styles     : {
            files: [ 'src/styles/**' ],
            tasks: [ 'clean:styles', 'sass:<%= config.type %>' ]
        },
        scripts    : {
            files: [ 'src/scripts/**' ],
            tasks: [ 'copy:scripts' ]
        },
        views      : {
            files: [ 'src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**' ],
            tasks: [ 'clean:views', 'jade:<%= config.type %>', 'bootlint' ] //, 'bootlint' ]
        },
        views_pages: {
            files: [ 'src/views/pages/**/*.jade' ],
            tasks: [ 'newer:jade:<%= config.type %>' ]
        },
        images     : {
            files: [ 'src/images/**' ],
            tasks: [ 'clean:images', 'copy:images' ]
        },
        templates  : {
            files: [ 'src/views/tpls/**/*.jade' ],
            tasks: [ 'templates' ]
        },
        vendor     : {
            files: [ 'src/vendor/**' ],
            tasks: [ 'clean:vendor', 'copy:vendor', 'copy:scripts', 'uglify:<%= config.name %>', '<%= config.name %>:jsbuild' ]
        },
        demo       : {
            files: [ 'src/demo/**' ],
            tasks: [ 'clean:demo', 'copy:demo' ]
        },
        livereload : {
            options: {livereload: 35729},
            files  : [ 'src/**/*' ]
        }
    };
    // Only include watch tasks that are enabled in the builder's task.watch array
    builder.watchers.forEach(function( watcherName ){
        gruntConfig.watch[ watcherName ] = watchers[ watcherName ];
    });


    // Add jsbuild configuration, based on all previously set config items so include last
    gruntConfig = require('./grunt/config/jsbuild')(config, gruntConfig, builderConfig, grunt);
    if(builder.gruntConfig){ // And the builder can overide it all
        gruntConfig = _.merge(gruntConfig, builder.gruntConfig);
    }
    grunt.initConfig(gruntConfig);

    registerAvailableTasks(grunt, config);

    // Register global tasks
    // Watch

    grunt.registerTask(builderConfig.name + ':watch', [ 'watch' ]);

    // Tasks

    // Clean scripts
    grunt.registerTask('clean:scripts', function(){
        require('globule').find([ builderConfig.dest + '/assets/scripts/**', '!' + builderConfig.dest + '/assets/scripts/plugins/**', builderConfig.dest + '/assets/scripts/plugins/*/**' ]).forEach(function( delPath ){
            if( fs.statSync(delPath).isFile() ){
                fs.unlinkSync(delPath);
            }
        });
    });

    // Switch jade layout for all pages
    grunt.registerTask('jade_layout', function(target){
        var layoutsDir = path.resolve(__dirname, 'src/views/layouts');
        var targets = ['base', 'jekyll'];
        if(targets.indexOf(target) === -1){
            grunt.fail.fatal('target not supported');
        }
        fs.outputFileSync(layoutsDir + '/default.jade', 'extends ' + target);
        ok('Switched jade layout to ' + target);
    });

    grunt.event.on('task.build', function(a){

        //grunt.fail.fatal(a);
        if( a.indexOf('base') === -1 ){
            ok('not a base build');
            var first = a.split(':')[0];
            if(builders.indexOf(first) !== -1 ){
                ok('its a ' + first);
                init(grunt, first);
            }

        }
    })

};

function registerAvailableTasks( grunt, config ){


    // Register shared builder tasks and prefix them with the current selected builder name
    var taskDesc = {
        templates      : 'creates pre-compiled jade templates for browser useage.',
        scripts        : 'creates the scripts',
        copy           : 'copies most directories',
        assets         : 'builds the assets',
        build          : 'builds the project',
        watch          : 'watches the project',
        'scripts:clean': 'cleans the scripts'
    };
    //builder.tasks = lib.objectKeyReplace(builder.tasks, builderReplacerMap);

    _.each(config.builders, function( builderConfig, builderName ){
        builderConfig.name = builderName;
        var builder = require('./grunt/builders/' + builderName)(builderConfig, grunt);

        var renames = {
            BNAME: builder.config.name,
            BTYPE: builder.config.type,
            BDEST: builder.config.dest
        };
        builder.tasks = lib.replaceObjectArrayValueByMap(builder.tasks, renames);

        _.each(builder.tasks, function( subTasks, taskName ){
            if( taskName === 'watch' ){
                return;
            }
            var replacedTaskName = lib.replaceStringByMap(taskName, renames);


            grunt.registerTask(lib.replaceStringByMap(taskName, renames), taskDesc[ taskName ], function(){
                grunt.event.emit('task.build', replacedTaskName);
                grunt.task.run(subTasks);
            });
        });

        var availableTaskConfig = grunt.config.get('availabletasks.tasks');

        var tasks = availableTaskConfig.options.tasks.concat(lib.replaceArrayByMap(builder.availabletasks.tasks, renames));

        //grunt.log.writeflags(tasks);
        grunt.config.set('availabletasks.tasks.options.tasks', tasks);

    });
    grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', function(){
        //grunt.log.writeflags();
        grunt.initConfig(grunt.config.get());
        grunt.task.run([ 'availabletasks' ]);
    });
}


if(!module.parent){
    init(require('grunt-cli'));
}
