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

var init = module.exports = function( grunts ){
    grunt = grunts;

    grunt.inspect = log;
    var ok = grunt.log.ok;

    var _config = grunt.file.readYAML('config.yml');
    var target = grunt.option('target') || _config.target || 'dev';
    _config.targets[ target ].name = target;

    var gruntConfig = {
        debug           : {
            inspector: true
        },
        config          : _config,
        target          : _config.targets[ target ],
        jsbuild         : _config.jsbuild,
        clean           : {
            all      : {src: '<%= target.dest %>/*'},
            assets   : {src: '<%= target.dest %>/assets'},
            fonts    : {src: '<%= target.dest %>/assets/fonts'},
            images   : {src: '<%= target.dest %>/assets/images'},
            styles   : {src: '<%= target.dest %>/assets/styles'},
            plugins  : {src: '<%= target.dest %>/assets/scripts/plugins'},
            templates: {src: '<%= target.dest %>/assets/scripts/templates'},
            demo     : {src: '<%= target.dest %>/demo'},
            views    : {src: '<%= target.dest %>/**/*.html'}
        },
        copy            : {
            fonts  : {
                files: [
                    {expand: true, cwd: 'src/plugins/bootstrap/fonts', src: '**', dest: '<%= target.dest %>/assets/fonts'},
                    {expand: true, cwd: 'src/plugins/font-awesome/fonts', src: '**', dest: '<%= target.dest %>/assets/fonts'}
                ]
            },
            images : {files: [ {expand: true, cwd: 'src/images', src: '**', dest: '<%= target.dest %>/assets/images'} ]},
            scripts: {files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: '<%= target.dest %>/assets/scripts'} ]},
            plugins: {files: [ {expand: true, cwd: 'src/plugins', src: '**', dest: '<%= target.dest %>/assets/scripts/plugins'} ]},
            demo   : {files: [ {expand: true, cwd: 'src/demo', src: '**', dest: '<%= target.dest %>/demo'} ]},
            misc   : {files: [ {src: 'src/.htaccess', dest: '<%= target.dest %>/.htaccess'} ]}
        },
        jade            : {
            dev      : {
                options: {data: {}, filters: {}, pretty: true},
                files  : [ {expand: true, cwd: 'src/views/pages', src: [ '**/*.jade', '!plugins/**' ], ext: '.html', dest: '<%= target.dest %>'} ]
            },
            dist     : {
                options: {data: {}, filters: {}, pretty: false},
                files  : [ {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: '<%= target.dest %>'} ]
            },
            templates: {
                options: {
                    client   : true,
                    pretty   : false,
                    amd      : true,
                    namespace: false
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: '<%= target.dest %>/assets/scripts/templates'}
                ]
            }
        },
        jade_config     : {
            dev : {full: false},
            dist: {full: true}
        },
        'string-replace': {
            templates: {
                files  : {'<%= target.dest %>/assets/scripts/templates/': '<%= target.dest %>/assets/scripts/templates/**'},
                options: {
                    replacements: [ {pattern: 'src/views/tpls/', replacement: ''} ]
                }
            }
        },
        sass            : {
            options: {sourcemap: 'none', compass: true},
            dev    : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'} ]
            },
            dist   : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'} ]
            }
        },
        uglify          : {
            dev: {
                options: {sourceMap: true, compress: false, beautify: true, gzip: true, preserveComments: 'all'},
                files  : {
                    '<%= target.dest %>/assets/scripts/plugins/modernizr.js' : [ 'src/plugins/modernizr/modernizr.js' ],
                    '<%= target.dest %>/assets/scripts/plugins/bootbox.js'   : [ 'src/plugins/bootbox/bootbox.js' ],
                    '<%= target.dest %>/assets/scripts/plugins/mscrollbar.js': [ 'src/plugins/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    '<%= target.dest %>/assets/scripts/plugins/require.js'   : [ 'src/plugins/requirejs/require.js' ]
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
            files  : [ '<%= target.dest %>/*/*.html', '<%= target.dest %>/*.html' ]
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
        availabletasks  : {
            tasks: {
                options: {
                    filter: 'include',
                    tasks : [ 'tasks', 'assets', 'build', 'cp', 'rm', 'scripts', 'templates', 'views', 'watch' ]
                }
            }
        },
        frontmatter     : {
            dev: {
                files: {
                    src: [ '<%= target.dest %>/**/*.html', '!<%= target.dest %>/assets/**' ]
                }
            }
        },
        watch           : {
            options    : {livereload: true, nospawn: true},
            styles     : {
                files: [ 'src/styles/**' ],
                tasks: [ 'clean:styles', 'sass:<%= target.type %>' ]
            },
            scripts    : {
                files: [ 'src/scripts/**' ],
                tasks: [ 'copy:scripts' ]
            },
            views      : {
                files: [ 'src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**' ],
                tasks: [ 'clean:views', 'jade:<%= target.type %>', 'bootlint' ] //, 'bootlint' ]
            },
            views_pages: {
                files: [ 'src/views/pages/**/*.jade' ],
                tasks: [ 'newer:jade:<%= target.type %>' ]
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
                tasks: [ 'clean:vendor', 'copy:vendor', 'copy:scripts', 'uglify:<%= target.name %>', '<%= target.name %>:jsbuild' ]
            },
            demo       : {
                files: [ 'src/demo/**' ],
                tasks: [ 'clean:demo', 'copy:demo' ]
            },
            livereload : {
                options: {livereload: 35729},
                files  : [ 'src/**/*' ]
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.loadTasks('tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);


    grunt.registerTask('rm', 'Removes the dest dir', [ 'clean:all' ]);
    grunt.registerTask('templates', 'Generates all javascript based templates', [ 'clean:templates', 'jade:templates', 'string-replace:templates' ]);
    grunt.registerTask('scripts', 'Generates all script assets', [ 'clean:scripts', 'copy:plugins', 'copy:scripts', 'templates', 'uglify:' + target ]);
    grunt.registerTask('cp', 'Copies all files that do not require processing', [ 'copy:images', 'copy:fonts', 'copy:misc', 'copy:demo' ]);
    grunt.registerTask('assets', 'Generates all assets', [ 'clean:assets', 'cp', 'scripts', 'jsbuild', 'copy:scripts', 'sass:' + target ]);
    grunt.registerTask('views', 'Generates all views/html files', [ 'clean:views', 'jade_config', 'jade:' + target ]);
    grunt.registerTask('watch', 'Acts upon file changes during development', [ 'watch' ]);
    grunt.registerTask('build', 'Generates a full website build', [
        'rm', 'cp',
        'sass:' + target, 'jade_config', 'jade:' + target,
        'scripts', 'jsbuild'
    ]);

    grunt.registerTask('clean:scripts', function(){
        grunt.log.writeln(grunt.config.get('target.dest'));
        require('globule').find([ grunt.config.get('target.dest') + '/assets/scripts/**', '!' + grunt.config.get('target.dest') + '/assets/scripts/plugins/**', grunt.config.get('target.dest') + '/assets/scripts/plugins/*/**' ]).forEach(function( delPath ){
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

    grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', function(){
        //grunt.log.writeflags();
        //grunt.initConfig(grunt.config.get());
        grunt.task.run([ 'availabletasks' ]);
    });

    grunt.event.on('task.start', function( a ){
        debug('task event', a);
    });
    grunt.event.on('task.done', function( a ){
        debug('task event', a);
    });

};
