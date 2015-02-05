/* jshint camelcase: false */

'use strict';

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('./lib');


module.exports = function( grunt ){


    grunt.loadTasks('lib/grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var concatJsdev = [], cleanJsdev = [];
    [ 'side-nav', 'topmenu', 'packadic' ].forEach(function( fileName ){
        concatJsdev.push('src/scripts/' + fileName + '.js');
        cleanJsdev.push('dev/assets/js/' + fileName + '.js');
    });

    var config = grunt.file.readYAML('config.yml');

    var cfg = {
        config: config,
        copy            : {
            dev: {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/images', src: '**', dest: 'dev/assets/images'},
                    {expand: true, cwd: 'src/vendor', src: '**', dest: 'dev/assets/vendor'}
                ]
            },
            dev_images: { files: [ {expand: true, cwd: 'src/images', src: '**', dest: 'dev/assets/images'}] },
            dev_scripts: { files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: 'dev/assets/vendor/packadic'}] },
            dev_vendor: { files: [ {expand: true, cwd: 'src/vendor', src: '**', dest: 'dev/assets/vendor'}] }
        },
        clean           : {
            dev        : {src: 'dev/*'},
            dev_fonts  : {src: 'dev/assets/fonts'},
            dev_images : {src: 'dev/assets/images'},
            dev_scripts: {src: 'dev/assets/vendor/packadic'},
            dev_styles : {src: 'dev/assets/styles'},
            dev_vendor : {src: 'dev/assets/vendor'},
            dev_tpls   : {src: 'dev/assets/tpls'},
            dev_views  : {src: 'dev/**/*.html'},
            jsdev      : {src: cleanJsdev}
        },
        concat          : {
            jsdev: {
                files: [
                    {src: concatJsdev, dest: 'dev/assets/scripts/theme.js'}
                ]
            }
        },

        'string-replace': {
            tpls: {
                files  : {
                    'dev/assets/tpls/': 'dev/assets/tpls/**'
                },
                options: {
                    replacements: [
                        {
                            pattern    : 'src/views/tpls/',
                            replacement: ''
                        }
                    ]
                }
            }
        },

        sass            : {
            options: {
                sourcemap: 'none',
                compass: true
            },
            dev    : {
                files: [
                    {expand: true, cwd: 'src/styles', src: '*.scss', ext: '.css', dest: 'dev/assets/styles'}
                ]
            }
        },
        useminPrepare   : {
            build: {
                options: {
                    root : 'dev',
                    steps: {
                        js : [ 'concat', 'uglifyjs' ],
                        css: [ 'cssmin' ]
                    },
                    dest : 'dev'
                },
                files  : {
                    src: [ 'dev/_includes/_layouts/*.html' ]
                }
            }
        },
        jade: require('./lib/grunt/config/jade')(grunt),
        usemin          : {
            options: {
                assetsDirs: [ 'dev/assets' ]
            },
            html   : {
                src: [ 'dev/_includes/_layouts/*.html' ]
            }
        },
        watch           : {
            options      : {
                livereload: true
            },
            styles       : {
                files: [ 'src/styles/**' ],
                tasks: [ 'clean:dev_styles',  'sass:dev' ]
            },
            jsdev_scripts: {
                files: [ 'src/scripts/*.js' ],
                tasks: [ 'clean:dev_scripts', 'copy:dev_scripts' ]
            },
            views        : {
                files: [ 'src/views/**/*.jade', '!src/views/tpls/**' ],
                tasks: [ 'clean:dev_views', 'jade:dev' ] //, 'bootlint' ]
            },
            images: {
                files: ['src/images/**'],
                tasks: ['clean:dev_images', 'copy:dev_images']
            },
            tpls         : {
                files: [ 'src/views/tpls/**/*.jade' ],
                tasks: [ 'dev_tpls' ]
            },
            vendor         : {
                files: [ 'src/vendor/**' ],
                tasks: [ 'clean:dev_vendor', 'copy:dev_vendor', 'copy:dev_scripts' ]
            },
            livereload   : {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files  : [
                    'src/**/*'
                ]
            }
        },
        concurrent      : {
            options: {
                logConcurrentOutput: true
            },
            serve  : [ 'connect:livereload:keepalive', 'watch' ]
        },

        bin     : {
            highlightjs: {

                options : {
                    wrap: [ 'node', 'mv' ],
                    cwd : 'lib/highlightjs'
                },
                commands: [
                    [ 'node', 'tools/build.js', {t: 'browser'}, ':common' ],
                    [ 'mv', 'build/highlight.pack.js', path.resolve(__dirname, 'dev/assets/scripts/highlight.pack.js') ]
                ]
            }
        },
        bootlint: {
            options: {
                stoponerror: false,
                relaxerror : []
            },
            files  : [ 'dev/*/*.html', 'dev/*.html' ]

        },
        connect : {
            options   : {
                port      : "<%= config.host.port %>",
                // Change this to '0.0.0.0' to access the server from outside.
                hostname  : "<%= config.host.name %>",
                livereload: 35729
            },
            livereload: {
                options: {
                    open      : true,
                    base      : 'dev',
                    middleware: function( connect, options ){
                        var middlewares = [];
                        middlewares.push(lib.getMiddleware('rewrite'));
                        middlewares.push(lib.getMiddleware('pygments'));
                        //middlewares.push(lib.getMiddleware('connect'));


                        /*
                         || CONNECT
                         */
                        if( !Array.isArray(options.base) ){
                            options.base = [ options.base ];
                        }

                        var directory = options.directory || options.base[ options.base.length - 1 ];
                        options.base.forEach(function( base ){
                            // Serve static files.
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                },
                dist   : {
                    options: {
                        open: true,
                        base: 'test'
                    }
                }
            }
        }
    };


    grunt.initConfig(cfg);


    grunt.registerTask('default', []);

    grunt.registerTask('dev_tpls', [ 'clean:dev_tpls', 'jade:tpls', 'string-replace:tpls' ]);
    grunt.registerTask('build', [ 'clean:dev', 'copy:dev', 'concat:jsdev', 'bin:highlightjs', 'sass:dev', 'jade:dev', 'dev_tpls', 'clean:jsdev' ]); //, 'bootlint'

    grunt.registerTask('minify', function(){
        if( target === 'dist' ){
            return grunt.task.run([
                'build',
                'connect:dist:keepalive'
            ]);
        }
        grunt.task.run([
            'build',
            'configureRewriteRules',
            'concurrent:serve' ]);
    });

    grunt.registerTask('minify', [
        'useminPrepare', // optimize all files and assets
        'concat',
        'uglify',
        'cssmin',
        'usemin'
    ]);
    grunt.registerTask('serve', [ 'build', 'concurrent:serve' ]);
    grunt.registerTask('serve:fast', [ 'concurrent:serve' ]);

};

