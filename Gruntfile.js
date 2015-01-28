/* jshint camelcase: false */

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path');


module.exports = function( grunt ){
    'use-strict';

    grunt.loadTasks('lib/grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var concatJsdev = [], cleanJsdev = [];
    [ 'sidemenu', 'topmenu', 'packadic' ].forEach(function( fileName ){
        concatJsdev.push('src/scripts/' + fileName + '.js');
        cleanJsdev.push('dev/assets/js/' + fileName + '.js');
    });

    var getJadeData = function(){
        function getyml( fileName ){
            return jsyaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'src/data', fileName + '.yml'), 'utf-8'));
        }

        var site = getyml('site');
        site.data = {};
        [ 'navigation', 'author', 'main', 'social', 'widgets' ].forEach(function( fileName ){
            site.data[ fileName ] = getyml(fileName);
        });
        return {site_json: JSON.stringify(site), site: site};
    };

    var cfg = {
        copy            : {
            dev: {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/images', src: '**', dest: 'dev/assets/images'},
                    {expand: true, cwd: 'src/vendor', src: '**', dest: 'dev/assets/vendor'}
                ]
            }
        },
        clean           : {
            dev        : {src: 'dev/*'},
            dev_fonts  : {src: 'dev/assets/fonts'},
            dev_images : {src: 'dev/assets/images'},
            dev_scripts: {src: 'dev/assets/scripts'},
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
        jade            : {
            options: {
                pretty: true,
                data  : getJadeData
            },
            dev    : {
                files: [
                    {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: 'dev'}
                ]
            },
            tpls   : {
                options: {
                    client   : true,
                    pretty   : false,
                    namespace: 'tpls'
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: 'dev/assets/tpls'}
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
                sourcemap: 'none'
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
                tasks: [ 'clean:dev_styles', 'sass:dev' ]
            },
            jsdev_scripts: {
                files: [ 'src/scripts/*.js' ],
                tasks: [ 'clean:jsdev', 'concat:jsdev' ]
            },
            views        : {
                files: [ 'src/views/**/*.jade', '!src/views/tpls/**' ],
                tasks: [ 'clean:dev_views', 'jade:dev' ]
            },
            tpls         : {
                files: [ 'src/views/tpls/**/*.jade' ],
                tasks: [ 'dev_tpls' ]
            },
            copy         : {
                files: [ 'src/{images,fonts,vendor/**' ],
                tasks: [ 'clean:dev_images', 'clean:dev_fonts', 'clean:dev_vendor', 'copy:dev' ]
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
        connect         : {
            options   : {
                port      : 9009,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname  : '0.0.0.0',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    base: 'dev'
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

    grunt.registerTask('dev_tpls', ['clean:dev_tpls', 'jade:tpls', 'string-replace:tpls']);
    grunt.registerTask('build', [ 'clean:dev', 'copy:dev', 'concat:jsdev', 'sass:dev', 'jade:dev', 'dev_tpls', 'clean:jsdev' ]);

    grunt.registerTask('minify', function(){
        if( target === 'dist' ){
            return grunt.task.run([ 'build', 'connect:dist:keepalive' ]);
        }
        grunt.task.run([ 'build', 'concurrent:serve' ]);
    });

    grunt.registerTask('minify', [
        'useminPrepare', // optimize all files and assets
        'concat',
        'uglify',
        'cssmin',
        'usemin'
    ]);
    grunt.registerTask('serve', [ 'build', 'concurrent:serve' ]);

};

