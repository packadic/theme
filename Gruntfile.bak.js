/* jshint camelcase: false */

'use strict';

var radic  = require('radic'),
    _      = require('lodash'),
    util   = require('util'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    lib    = require('./lib');

var grunt;


function log(){
    _.toArray(arguments).forEach(function( vl ){
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function debug( str ){
    grunt.log.debug(str)
}

function emit(){
    var args = _.toArray(arguments);
    grunt.log.debug(args[ 0 ]);
    grunt.event.emit.apply(grunt.event, args);
}

function on(){
    grunt.event.on.apply(grunt.event, _.toArray(arguments));
}

function dd(){
    log.apply(log, _.toArray(arguments));
    process.exit()
}

var init = module.exports = function( grunts, builderName ){
    builderName = builderName || grunts.option('builder');
    builderName = builderName || 'base';

    grunt = grunts;
    grunt.inspect = log;
    var ok = grunt.log.ok;

    var gruntConfig = {
        debug           : {
            inspector: true
        },
        config          : {},
        builder         : {},
        builders        : {},
        clean           : {
            all      : {src: '<%= builder.dest %>/*'},
            assets   : {src: '<%= builder.dest %>/assets'},
            fonts    : {src: '<%= builder.dest %>/assets/fonts'},
            images   : {src: '<%= builder.dest %>/assets/images'},
            styles   : {src: '<%= builder.dest %>/assets/styles'},
            plugins  : {src: '<%= builder.dest %>/assets/scripts/plugins'},
            templates: {src: '<%= builder.dest %>/assets/scripts/templates'},
            demo     : {src: '<%= builder.dest %>/demo'},
            views    : {src: '<%= builder.dest %>/**/*.html'}
        },
        copy            : {
            fonts  : {
                files: [
                    {expand: true, cwd: 'src/plugins/bootstrap/fonts', src: '**', dest: '<%= builder.dest %>/assets/fonts'},
                    {expand: true, cwd: 'src/plugins/font-awesome/fonts', src: '**', dest: '<%= builder.dest %>/assets/fonts'}
                ]
            },
            images : {files: [ {expand: true, cwd: 'src/images', src: '**', dest: '<%= builder.dest %>/assets/images'} ]},
            scripts: {files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: '<%= builder.dest %>/assets/scripts'} ]},
            plugins: {files: [ {expand: true, cwd: 'src/plugins', src: '**', dest: '<%= builder.dest %>/assets/scripts/plugins'} ]},
            demo   : {files: [ {expand: true, cwd: 'src/demo', src: '**', dest: '<%= builder.dest %>/demo'} ]},
            misc   : {files: [ {src: 'src/.htaccess', dest: '<%= builder.dest %>/.htaccess'} ]}
        },
        jade            : {
            dev      : {
                options: {data: {}, filters: {}, pretty: true},
                files  : [ {expand: true, cwd: 'src/views/pages', src: [ '**/*.jade', '!plugins/**' ], ext: '.html', dest: '<%= builder.dest %>'} ]
            },
            dist     : {
                options: {data: {}, filters: {}, pretty: false},
                files  : [ {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: '<%= builder.dest %>'} ]
            },
            templates: {
                options: {
                    client   : true,
                    pretty   : false,
                    amd      : true,
                    namespace: false
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: '<%= builder.dest %>/assets/scripts/templates'}
                ]
            }
        },
        'string-replace': {
            templates: {
                files  : {'<%= builder.dest %>/assets/scripts/templates/': '<%= builder.dest %>/assets/scripts/templates/**'},
                options: {
                    replacements: [ {pattern: 'src/views/tpls/', replacement: ''} ]
                }
            }
        },
        sass            : {
            options: {sourcemap: 'none', compass: true},
            dev    : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= builder.dest %>/assets/styles'} ]
            },
            dist   : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= builder.dest %>/assets/styles'} ]
            }
        },
        uglify          : {
            dev: {
                options: {sourceMap: true, compress: false, beautify: true, gzip: true, preserveComments: 'all'},
                files  : {
                    '<%= builder.dest %>/assets/scripts/plugins/modernizr.js' : [ 'src/plugins/modernizr/modernizr.js' ],
                    '<%= builder.dest %>/assets/scripts/plugins/bootbox.js'   : [ 'src/plugins/bootbox/bootbox.js' ],
                    '<%= builder.dest %>/assets/scripts/plugins/mscrollbar.js': [ 'src/plugins/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    '<%= builder.dest %>/assets/scripts/plugins/require.js'   : [ 'src/plugins/requirejs/require.js' ]
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
            files  : [ '<%= builder.dest %>/*/*.html', '<%= builder.dest %>/*.html' ]
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
                options: {
                    filter: 'include',
                    tasks : [ 'tasks' ]
                }
            }
        },
        frontmatter     : {
            dev: {
                files: {
                    src: [ '<%= builder.dest %>/**/*.html', '!<%= builder.dest %>/assets/**' ]
                }
            }
        }
    };
    var watchers = {
        styles     : {
            files: [ 'src/styles/**' ],
            tasks: [ 'clean:styles', 'sass:<%= builder.type %>' ]
        },
        scripts    : {
            files: [ 'src/scripts/**' ],
            tasks: [ 'copy:scripts' ]
        },
        views      : {
            files: [ 'src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**' ],
            tasks: [ 'clean:views', 'jade:<%= builder.type %>', 'bootlint' ] //, 'bootlint' ]
        },
        views_pages: {
            files: [ 'src/views/pages/**/*.jade' ],
            tasks: [ 'newer:jade:<%= builder.type %>' ]
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
            tasks: [ 'clean:vendor', 'copy:vendor', 'copy:scripts', 'uglify:<%= builder.name %>', '<%= builder.name %>:jsbuild' ]
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

    gruntConfig.watchers = watchers;
    gruntConfig.config = grunt.file.readYAML('config.yml');
    gruntConfig.builders = gruntConfig.config.builders;
    gruntConfig.builder.name = builderName;
    grunt.initConfig(gruntConfig);

    initActiveBuilder(grunt);
    //registerAvailableTasks(grunt);


    grunt.loadTasks('grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.registerTask('clean:scripts', function(){
        grunt.log.writeln(grunt.config.get('config.dest'));
        require('globule').find([ grunt.config.get('config.dest') + '/assets/scripts/**', '!' + grunt.config.get('config.dest') + '/assets/scripts/plugins/**', grunt.config.get('config.dest') + '/assets/scripts/plugins/*/**' ]).forEach(function( delPath ){
            if( fs.statSync(delPath).isFile() ){
                fs.unlinkSync(delPath);
            }
        });
    });

    // Switch jade layout for all pages
    grunt.registerTask('jade_layout', function( target ){
        var layoutsDir = path.resolve(__dirname, 'src/views/layouts');
        var targets = [ 'base', 'jekyll' ];
        if( targets.indexOf(target) === -1 ){
            grunt.fail.fatal('target not supported');
        }
        fs.outputFileSync(layoutsDir + '/default.jade', 'extends ' + target);
        ok('Switched jade layout to ' + target);
    });

    grunt.event.on('task.build', function( a ){
        if( a.indexOf('base') === -1 ){
            ok('not a base build');
            var first = a.split(':')[ 0 ];
            if( builders.indexOf(first) !== -1 ){
                ok('its a ' + first);
                init(grunt, first);
            }
        }
    });

};

function registerAvailableTasks( grunt ){


    // Register shared builder tasks and prefix them with the current selected builder name
    var taskDesc = {
        templates      : 'creates pre-compiled jade templates for browser useage.',
        scripts        : 'creates the scripts',
        copy           : 'copies most directories',
        assets         : 'builds the assets',
        build          : 'builds the project',
        watch          : 'watches the project',
        views          : '',
        fm             : '',
        clean          : '',
        'scripts:clean': 'cleans the scripts'
    };


    var newConfig = grunt.config.getRaw();
    _.each(newConfig.builders, function( builderConfig, name ){


        newConfig.builders[ name ].name = name;

        // extend config.yml/builders/current with builders/js
        newConfig.builders[ name ] = _.merge(newConfig.builders[ name ], require('./grunt/builders/' + name)(grunt));

        var renames = {
            BNAME: name,
            BTYPE: newConfig.builders[ name ].type,
            BDEST: newConfig.builders[ name ].dest
        };
        log(renames);
        newConfig.builders[ name ].tasks = lib.replaceObjectArrayValueByMap(newConfig.builders[ name ].tasks, renames);
        log(name, newConfig.builders[ name ].tasks);

        dd('ending');
        var newTasks = {};
        _.each(newConfig.builders[ name ].tasks, function( subTasks, taskName ){
            if( taskName === 'watch' ){
                return;
            }
            var replacedTaskName = lib.replaceStringByMap(taskName, renames);
            newTasks[ replacedTaskName ] = subTasks;

            grunt.registerTask(replacedTaskName, taskDesc[ taskName ] || '', subTasks);
            /*function(){
             grunt.event.emit('task.build', replacedTaskName);
             grunt.task.run(subTasks);
             });*/
        });
        newConfig.builders[ name ].tasks = newTasks;
        log('newConfig.builders[name].tasks', newConfig.builders[ name ].tasks)



        //var tasks = newConfig.availabletasks.tasks.options.tasks.concat(lib.replaceArrayByMap(newConfig.builders[ name ].availabletasks.tasks, renames));
        //log('tasks', tasks);
        //newConfig.availabletasks.tasks = tasks;
        //log('availabletasks', newConfig.availabletasks)
    });
    log(newConfig);

    //grunt.config.merge(newConfig);
    return;

    log('register task');

    grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', function(){
        //grunt.log.writeflags();
        //grunt.initConfig(grunt.config.get());
        grunt.task.run([ 'availabletasks' ]);
    });
}

function initActiveBuilder( grunt ){

    var newConfig = grunt.config.getRaw();
    var name = newConfig.builder.name;

    // overide with builder/yml
    newConfig.builder = _.merge(newConfig.builder, grunt.file.readYAML('grunt/builders/' + name + '.yml'));
    // overide with builder/js
    newConfig.builder = _.merge(newConfig.builder, require('./grunt/builders/' + name)(grunt));
    // overide with config.yml/builder
    newConfig.builder = _.merge(newConfig.builder, grunt.config('config.builders.' + name));

    var type = newConfig.builder.type = grunt.option('type') || newConfig.builder.type;

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
    var jadeData = lib.getJadeData(grunt);
    newConfig.jade[ type ].options.data = jadeData;
    newConfig.jade[ type ].options.filters = jadeFilters;

    grunt.config.merge(newConfig);
    emit('jade.data', jadeData);


    var site = lib.getyml('src/data/site.yml');
    site.data = {};
    [ 'navigation', 'author', 'main', 'social', 'widgets', 'theme' ].forEach(function( fileName ){
        site.data[ fileName ] = lib.getyml('src/data/' + fileName + '.yml');
    });

    // the default 'site' and data get overriden by the config.yml active builder
    newConfig.builder.site = _.merge(site, newConfig.builder.site);


    /*
     var renames = {
     BNAME: newConfig.builder.name,
     BTYPE: newConfig.builder.type,
     BDEST: newConfig.builder.dest
     };
     newConfig.builder.tasks = lib.replaceObjectArrayValueByMap(newConfig.builder.tasks, renames);
     dd(newConfig.builder.tasks);
     newConfig.availabletasks.tasks.options = {
     filter  : 'include',
     tasks   : [ 'tasks' ].concat(lib.replaceArrayByMap(newConfig.builder.availabletasks.tasks, renames)),
     reporter: lib.getAvailableTaskReporter(newConfig.builder.availabletasks.reporterOptions)
     };

     // Only include watch tasks that are enabled in the builder's task.watch array
     */
    newConfig.availabletasks.tasks.options.reporter = lib.getAvailableTaskReporter(newConfig.builder.availabletasks.reporterOptions);
    newConfig.builder.watchers.forEach(function( watcherName ){
        newConfig.watch[ watcherName ] = newConfig.watchers[ watcherName ];
    });

    grunt.config.merge(newConfig);

    // Add jsbuild configuration, based on all previously set config items so include last
    require('./grunt/config/jsbuild')(grunt);
}
