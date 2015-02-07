/* jshint camelcase: false */

'use strict';

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    _s = require('underscore.string'),
    lib    = require('./lib');


module.exports = function( grunt ){

    var includeBuilds = false;
    var customTaskList = true;
    var config = grunt.file.readYAML('config.yml');


    var cfg = {
        config          : config,
        includeBuilds: includeBuilds,
        customTaskList: customTaskList,
        copy            : {
            dev_fonts  : {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: 'dev/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: 'dev/assets/fonts'}
                ]
            },
            dev_images : {files: [ {expand: true, cwd: 'src/images', src: '**', dest: 'dev/assets/images'} ]},
            dev_scripts: {files: [ {expand: true, cwd: 'src/scripts', src: '**', dest: 'dev/assets/scripts'} ]},
            dev_plugins : {files: [ {expand: true, cwd: 'src/plugins', src: '**', dest: 'dev/assets/scripts/plugins'} ]},
            dev_demo   : {files: [ {expand: true, cwd: 'src/demo', src: '**', dest: 'dev/demo'} ]},
            dev_misc   : {files: [ {src: 'src/.htaccess', dest: 'dev/.htaccess'} ]}
        },
        uglify          : {
            dev: {
                files: {
                    'dev/assets/scripts/plugins/modernizr.js' : [ 'src/plugins/modernizr/modernizr.js' ],
                    'dev/assets/scripts/plugins/bootbox.js'   : [ 'src/plugins/bootbox/bootbox.js' ],
                    'dev/assets/scripts/plugins/mscrollbar.js': [ 'src/plugins/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    'dev/assets/scripts/plugins/require.js'   : [ 'src/plugins/requirejs/require.js' ]
                }
            }
        },
        clean           : {
            dev        : {src: 'dev/*'},
            dev_fonts  : {src: 'dev/assets/fonts'},
            dev_images : {src: 'dev/assets/images'},
            //dev_scripts: {src: ['dev/assets/scripts/**', '!dev/assets/scripts/plugins/**', 'dev/assets/scripts/plugins/*/**']},
            dev_styles : {src: 'dev/assets/styles'},
            dev_plugins : {src: 'dev/assets/scripts/plugins'},
            dev_templates   : {src: 'dev/assets/scripts/templates'},
            dev_demo   : {src: 'dev/demo'},
            dev_views  : {src: 'dev/**/*.html'}
        },
        'string-replace': {
            templates: {
                files  : {'dev/assets/scripts/templates/': 'dev/assets/scripts/templates/**'},
                options: {
                    replacements: [ {pattern: 'src/views/tpls/', replacement: ''} ]
                }
            }
        },

        sass: {
            options: {sourcemap: 'none', compass: true},
            dev    : {
                files: [ {expand: true, cwd: 'src/styles', src: '**/*.scss', ext: '.css', dest: 'dev/assets/styles'} ]
            }
        },

        watch     : {
            options    : {livereload: true, nospawn: true},
            styles     : {
                files: [ 'src/styles/**' ],
                tasks: [ 'clean:dev_styles', 'sass:dev' ]
            },
            scripts    : {
                files: [ 'src/scripts/**' ],
                tasks: [ 'copy:dev_scripts' ]
            },
            views      : {
                files: [ 'src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**' ],
                tasks: [ 'clean:dev_views', 'jade:dev', 'bootlint' ] //, 'bootlint' ]
            },
            views_pages: {
                files: [ 'src/views/pages/**/*.jade' ],
                tasks: [ 'newer:jade:dev', 'bootlint' ]
            },
            images     : {
                files: [ 'src/images/**' ],
                tasks: [ 'clean:dev_images', 'copy:dev_images' ]
            },
            templates       : {
                files: [ 'src/views/tpls/**/*.jade' ],
                tasks: [ 'dev_templates' ]
            },
            vendor     : {
                files: [ 'src/vendor/**' ],
                tasks: [ 'clean:dev_vendor', 'copy:dev_vendor', 'copy:dev_scripts', 'uglify:dev', 'dev:jsbuild' ]
            },
            demo       : {
                files: [ 'src/demo/**' ],
                tasks: [ 'clean:dev_demo', 'copy:dev_demo' ]
            },
            livereload : {
                options: {livereload: 35729},
                files  : [ 'src/**/*' ]
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            build  : [
                'sass:dev', 'jade:dev', 'dev:templates',
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

    if(customTaskList == true){
        cfg.availabletasks = {
            tasks: {
                options: {
                    filter: 'include',
                    tasks: ['dev:scripts', 'dev:templates', 'dev:build', 'dev:watch', 'dev:jsbuild', 'tasks'],
                    reporter: function(options) {
                        var meta        = options.meta,
                            task        = options.currentTask,
                            targets     = '',
                            indentlevel = '';

                        var str = '';
                        if (meta.header && meta.groupCount) {
                            indentlevel = '#';
                            str += '## ' + task.group + '\n';
                        }

                        if (task.targets.length > 1) {
                            targets = indentlevel + '### Targets: `' + task.targets.join('`, `') + '`';
                        }
                        str += indentlevel + '## ' + task.name + '\n' + targets + '\n' + task.info + '\n';

                        var tskstr = fs.readFileSync('./tasks.md', 'utf-8')
                        if(tskstr.indexOf(str) === -1){
                            str = tskstr + str;
                        }
                        fs.outputFileSync('./tasks.md', str);


                        if (meta.header && meta.groupCount) {
                            console.log('\n' + radic.cli.bold(task.group));
                        }

                        if (task.targets.length > 1) {
                            targets = '(' + task.targets.join('|') + ')';
                        }


                        console.log(
                            radic.cli.cyan(_s.rpad(task.name, meta.longest)),
                            radic.cli.white(_s.center(task.type, 4)),
                            task.info,
                            radic.cli.green(targets)
                        );
                    }
                }
            }
        };
        grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', ['availabletasks']);
    }

    if( includeBuilds === true ){
        config.builds.forEach(function( build ){
            cfg = require('./grunt.build')(cfg, grunt, build);
        });
    }

    grunt.loadTasks('lib/grunt/tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig(cfg);


    grunt.registerTask('dev:templates', 'creates dev/scripts/templates | pre-compiled jade templates for browser useage.',
        [ 'clean:dev_templates', 'jade:dev_templates', 'string-replace:templates' ]);

    grunt.registerTask('dev:scripts', 'copy src/plugins > dev/scripts/plugins, minifies [require.js,modernizr.js,bootbox.js,mscrollbar.js] to dev/scripts/plugins, copy src/scripts/* > dev/assets/scripts',
        ['clean:dev_scripts', 'copy:dev_plugins', 'uglify:dev', 'copy:dev_scripts']);

    grunt.registerTask('dev:copy', 'copies src/{.htaccess,images,fonts,demo} to dev/assets/',
        [ 'copy:dev_images', 'copy:dev_fonts', 'copy:dev_misc', 'copy:dev_demo' ]);

    grunt.registerTask('dev:build', 'create a working development build in dev/', [
        'clean:dev', 'dev:copy',
        'sass:dev', 'jade:dev',
        'dev:scripts', 'dev:jsbuild',
        'copy:dev_scripts', 'uglify:dev',
        'dev:jsbuild'
    ]);
    grunt.registerTask('dev:build:fast', [ 'clean:dev', 'dev:copy', 'concurrent:build' ]);
    grunt.registerTask('dev:watch', 'generates dev/ files on changes + livereloads afterwards', [ 'watch' ]);
    grunt.registerTask('default', [ 'dev:build' ]);
    grunt.registerTask('clean:dev_scripts', function(){
        require('globule').find(['dev/assets/scripts/**', '!dev/assets/scripts/plugins/**', 'dev/assets/scripts/plugins/*/**']).forEach(function(delPath){
            if(fs.statSync(delPath).isFile()){
                fs.unlinkSync(delPath);
            }
        });
    })
};

