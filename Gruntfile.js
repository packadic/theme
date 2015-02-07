/* jshint camelcase: false */

'use strict';

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('./lib');


module.exports = function( grunt ){

    var includeBuilds = true;
    var config = grunt.file.readYAML('config.yml');


    var cfg = {
        config          : config,
        copy            : {
            dev_fonts        : {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: 'dev/assets/fonts'}
                ]
            },
            dev_images : {files: [ {expand: true, cwd: 'src/images', src: '**', dest: 'dev/assets/images'} ]},
            dev_scripts: {files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: 'dev/assets/vendor/packadic'} ]},
            dev_vendor : {files: [ {expand: true, cwd: 'src/vendor', src: '**', dest: 'dev/assets/vendor'} ]},
            dev_demo : {files: [ {expand: true, cwd: 'src/demo', src: '**', dest: 'dev/demo'} ]},
            dev_misc: {files:[{src: 'src/.htaccess', dest: 'dev/.htaccess'}]}
        },
        uglify          : {
            dev: {
                files: {
                    'dev/assets/vendor/modernizr.min.js' : [ 'src/vendor/modernizr/modernizr.js' ],
                    'dev/assets/vendor/bootbox.min.js'   : [ 'src/vendor/bootbox/bootbox.js' ],
                    'dev/assets/vendor/mscrollbar.min.js': [ 'src/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    'dev/assets/vendor/require.min.js'   : [ 'src/vendor/requirejs/require.js' ]
                }
            }
        },
        clean           : {
            dev        : {src: 'dev/*'},
            dev_fonts  : {src: 'dev/assets/fonts'},
            dev_images : {src: 'dev/assets/images'},
            dev_scripts: {src: 'dev/assets/vendor/packadic'},
            dev_styles : {src: 'dev/assets/styles'},
            dev_vendor : {src: 'dev/assets/vendor'},
            dev_tpls   : {src: 'dev/assets/tpls'},
            dev_demo   : {src: 'dev/demo'},
            dev_views  : {src: 'dev/**/*.html'}
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

        sass: {
            options: {
                sourcemap: 'none',
                compass  : true
            },
            dev    : {
                files: [
                    {expand: true, cwd: 'src/styles', src: '*.scss', ext: '.css', dest: 'dev/assets/styles'}
                ]
            }
        },

        watch     : {
            options   : {
                livereload: true
            },
            styles    : {
                files: [ 'src/styles/**' ],
                tasks: [ 'clean:dev_styles', 'sass:dev' ]
            },
            scripts   : {
                files: [ 'src/scripts/**' ],
                tasks: [ 'clean:dev_scripts', 'copy:dev_scripts' ]
            },
            views     : {
                files: [ 'src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**' ],
                tasks: [ 'clean:dev_views', 'jade:dev', 'bootlint' ] //, 'bootlint' ]
            },
            views_pages: {
                files: [ 'src/views/pages/**/*.jade'],
                tasks: [ 'newer:jade:dev', 'bootlint' ]
            },
            images    : {
                files: [ 'src/images/**' ],
                tasks: [ 'clean:dev_images', 'copy:dev_images' ]
            },
            tpls      : {
                files: [ 'src/views/tpls/**/*.jade' ],
                tasks: [ 'dev_tpls' ]
            },
            vendor    : {
                files: [ 'src/vendor/**' ],
                tasks: [ 'clean:dev_vendor', 'copy:dev_vendor', 'copy:dev_scripts', 'uglify:dev', 'dev:jsbuild' ]
            },
            demo: {
                files: ['src/demo/**'],
                tasks: ['clean:dev_demo', 'copy:dev_demo']
            },
            livereload: {
                options: {
                    livereload: 35729
                },
                files  : [
                    'src/**/*'
                ]
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            build  : [
                'sass:dev', 'jade:dev', 'dev:tpls',
                'copy:dev_scripts', 'uglify:dev',
                'lodashAutobuild:dev', 'shell:dev_jquery', 'bootstrapjs:dev', 'jqueryui:dev'
            ]
        },
        bootlint  : {
            options: {
                stoponerror: false,
                relaxerror : [
                    'E003', // Row not in .container error - Ignore because the .container is included in #page-wrapper scss
                    'W005' // Unable to find jQuery - Ignore because of require.js usage its not detected
                ]
            },
            files  : [ 'dev/*/*.html', 'dev/*.html' ]
        }
    };

    cfg = require('./lib/grunt/config/jade')(cfg, grunt, 'dev', 'dev');
    cfg = require('./lib/grunt/config/jsbuild')(cfg, grunt, 'dev', 'dev');

    if(includeBuilds === true){
        config.builds.forEach(function( build ){
            cfg = require('./grunt.build')(cfg, grunt, build);
        });
    }

    grunt.loadTasks('lib/grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig(cfg);


    grunt.registerTask('dev:tpls', [ 'clean:dev_tpls', 'jade:dev_tpls', 'string-replace:tpls' ]);
    grunt.registerTask('dev:copy', [ 'copy:dev_images', 'copy:dev_fonts', 'copy:dev_vendor', 'copy:dev_misc', 'copy:dev_demo' ]);
    grunt.registerTask('dev:build', [
        'clean:dev', 'dev:copy',
        'sass:dev', 'jade:dev', 'dev:tpls',
        'copy:dev_scripts', 'uglify:dev',
        'dev:jsbuild'
    ]);
    grunt.registerTask('dev:build:fast', ['clean:dev', 'dev:copy', 'concurrent:build']);
    grunt.registerTask('dev:watch', [ 'watch' ]);
    grunt.registerTask('default', ['dev:build']);
};

