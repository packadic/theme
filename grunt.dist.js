var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('./lib');


module.exports = function( config, grunt ){

    config = _.merge({

        clean           : {
            dist: {src: 'dist/*'}

        },
        copy            : {
            dist: {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: 'dist/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: 'dist/assets/fonts'},
                    {expand: true, cwd: 'src/images', src: '**', dest: 'dist/assets/images'},
                    {expand: true, cwd: 'src/vendor', src: '**', dest: 'dist/assets/vendor'},
                    {src: 'src/.htaccess', dest: 'dist/.htaccess'}
                ]
            }
        },
        uglify          : {
            dist        : {
                files: {
                    'dist/assets/vendor/modernizr.min.js' : [ 'src/vendor/modernizr/modernizr.js' ],
                    'dist/assets/vendor/bootbox.min.js'   : [ 'src/vendor/bootbox/bootbox.js' ],
                    'dist/assets/vendor/mscrollbar.min.js': [ 'src/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    'dist/assets/vendor/require.min.js'   : [ 'src/vendor/requirejs/require.js' ]
                }
            },
            dist_scripts: {
                files: [ {
                             expand: true,
                             cwd   : 'src/scripts',
                             src   : '**/*.js',
                             dest  : 'dist/assets/vendor/packadic'
                         } ]
            }
        },
        'string-replace': {
            dist_tpls: {
                files  : {
                    'dist/assets/tpls/': 'dist/assets/tpls/**'
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

            dist: {
                options: {
                    style: 'compressed'
                },
                files  : [
                    {expand: true, cwd: 'src/styles', src: '*.scss', ext: '.css', dest: 'dist/assets/styles'}
                ]
            }
        },
        cssmin : {
            minify: {
                expand: true,
                cwd   : 'dist/assets/styles/',
                src   : [ '*.css', '!*.min.css' ],
                dest  : 'dist/assets/styles/',
                ext   : '.css'
            }
        },
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments    : true,
                    collapseWhitespace: true
                },
                files  : [ {
                   expand: true,
                   cwd   : 'dist',
                   src   : [ '**/*.html', '!assets/**' ],
                   dest  : 'dist'
               } ]
            }
        }

    }, config);

    config = require('./lib/grunt/config/jade')(config, grunt, 'dist', 'dist');
    config = require('./lib/grunt/config/jsbuild')(config, grunt, 'dist', 'dist');


    grunt.registerTask('dist:build', [
        'clean:dist', 'copy:dist', // clean all, copy images, fonts, vendor
        'sass:dist', // sass to css compressed
        'jade:dist', 'jade:dist_tpls', 'string-replace:dist_tpls', // jade views and runtime javascript views (rename selector)
        'uglify:dist_scripts', // minify src/scripts to assets/scripts
        'uglify:dist', 'dist:jsbuild' // minify some vendor scripts to vendor/ and custom build jquery, lodash and bootstrap
    ]); //, 'bootlint'

    var todo = {
        useminPrepare: {
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
        usemin       : {
            options: {
                assetsDirs: [ 'dev/assets' ]
            },
            html   : {
                src: [ 'dev/_includes/_layouts/*.html' ]
            }
        }
    };
    return config;
};
