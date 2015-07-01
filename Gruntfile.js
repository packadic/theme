/* jshint camelcase: false */

'use strict';

var radic   = require('radic'),
    _       = require('lodash'),
    util    = require('util'),
    _s      = require('underscore.string'),
    jsyaml  = require('js-yaml'),
    fs      = require('fs'),
    globule = require('globule'),
    path    = require('path');

var grunt;


function log() {
    _.toArray(arguments).forEach(function (vl) {
        process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
    })
}

function debug(str) {
    grunt.log.debug(str)
}

function emit() {
    var args = _.toArray(arguments);
    grunt.log.debug(args[0]);
    grunt.event.emit.apply(grunt.event, args);
}

function on() {
    grunt.event.on.apply(grunt.event, _.toArray(arguments));
}

function dd() {
    log.apply(log, _.toArray(arguments));
    process.exit()
}

var init = module.exports = function (grunts) {
    grunt = grunts;

    grunt.inspect = log;
    var ok = grunt.log.ok;
    var _config = {},
        target, type;

    function mergeConfigFrom(configPath) {
        if ( ! _s.endsWith(configPath, '.yml') ) {
            configPath = path.resolve(configPath, 'config.yml');
        }
        ok('Merging config from: ' + configPath)
        _config = _.merge(_config, jsyaml.safeLoad(require('fs').readFileSync(configPath)));
        target = grunt.option('target') || _config.target || 'dev';
        type = grunt.option('type') || _config.type || 'dev';
        _config.targets[target].name = target;
        _config.targets[target].type = type;
    }

    mergeConfigFrom(__dirname);
//    mergeConfigFrom(process.cwd());
    var externalConfig = grunt.option('config');
    if ( externalConfig ) {
        mergeConfigFrom(externalConfig);
    }


    var uglifyFiles = {
        '<%= target.dest %>/assets/scripts/plugins/modernizr.js' : ['src/plugins/modernizr/modernizr.js'],
        '<%= target.dest %>/assets/scripts/plugins/bootbox.js'   : ['src/plugins/bootbox/bootbox.js'],
        '<%= target.dest %>/assets/scripts/plugins/mscrollbar.js': ['src/plugins/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js'],
        '<%= target.dest %>/assets/scripts/plugins/require.js'   : ['src/plugins/requirejs/require.js']
    };
    var tsAutoGenFiles = globule.find(path.join(process.cwd(), 'src/tscripts/amd/*.js')).map(path.basename);
    var tsAutoGenFilesIgnore = tsAutoGenFiles.map(function (val) {
        return '!src/scripts/' + val;
    });


    var gruntConfig = {
        debug           : {
            inspector: true
        },
        config          : _config,
        target          : _config.targets[target],
        jsbuild         : _config.jsbuild,
        uglify          : {
            dev      : {
                options: {sourceMap: false, compress: false, beautify: true, gzip: true, preserveComments: 'all'},
                files  : uglifyFiles
            },
            dist     : {
                options: {sourceMap: false, compress: true, beautify: false, gzip: true, preserveComments: 'none'},
                files  : uglifyFiles
            },
            templates: {
                files: [{
                    expand: true,
                    cwd   : '<%= target.dest %>/assets/scripts/templates',
                    src   : '**/*.js',
                    dest  : '<%= target.dest %>/assets/scripts/templates'
                }]
            }
        },
        clean           : {
            all      : {src: '<%= target.dest %>/*'},
            assets   : {src: '<%= target.dest %>/assets'},
            fonts    : {src: '<%= target.dest %>/assets/fonts'},
            images   : {src: '<%= target.dest %>/assets/images'},
            styles   : {src: '<%= target.dest %>/assets/styles'},
            plugins  : {src: '<%= target.dest %>/assets/scripts/plugins'},
            templates: {src: '<%= target.dest %>/assets/scripts/templates'},
            demo     : {src: '<%= target.dest %>/demo'},
            tmp      : {src: '<%= target.dest %>/.tmp'},
            views    : {src: '<%= target.dest %>/**/*.html'}
        },
        copy            : {
            fonts        : {
                files: [
                    {expand: true, cwd: 'src/plugins/bootstrap/fonts', src: '**', dest: '<%= target.dest %>/assets/fonts'},
                    {expand: true, cwd: 'src/plugins/bootstrap-material-design/fonts', src: '**', dest: '<%= target.dest %>/assets/fonts'},
                    {expand: true, cwd: 'src/plugins/font-awesome/fonts', src: '**', dest: '<%= target.dest %>/assets/fonts'}
                ]
            },
            sass         : {files: [{expand: true, cwd: 'src/styles', src: '**', dest: '<%= target.dest %>/assets/styles/sass'}]},
            images       : {files: [{expand: true, cwd: 'src/images', src: '**', dest: '<%= target.dest %>/assets/images'}]},
            scripts_watch: {files: [{expand: true, cwd: 'src/scripts', src: ['**', '!init.js'], dest: '<%= target.dest %>/assets/scripts'}]},
            scripts      : {files: [{expand: true, cwd: 'src/scripts', src: '**', dest: '<%= target.dest %>/assets/scripts'}]},
            plugins      : {files: [{expand: true, cwd: 'src/plugins', src: '**', dest: '<%= target.dest %>/assets/scripts/plugins'}]},
            demo         : {files: [{expand: true, cwd: 'src/demo', src: '**', dest: '<%= target.dest %>/demo'}]},
            misc         : {files: [{src: 'src/.htaccess', dest: '<%= target.dest %>/.htaccess'}]},
            favicon      : {files: [{src: 'src/favicon-html5.ico', dest: '<%= target.dest %>/favicon.ico'}]},
        },
        jade            : {
            dev      : {
                options: {data: {}, filters: {}, pretty: true},
                files  : [{expand: true, cwd: 'src/views/pages', src: ['**/*.jade', '!plugins/**'], ext: '.html', dest: '<%= target.dest %>'}]
            },
            dist     : {
                options: {data: {}, filters: {}, pretty: false},
                files  : [{expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: '<%= target.dest %>'}]
            },
            templates: {
                options: {
                    client   : true,
                    pretty   : false,
                    amd      : true,
                    namespace: false
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: ['**/*.jade', '!**/_*.jade'], ext: '.js', dest: '<%= target.dest %>/assets/scripts/templates'}
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
                    replacements: [{pattern: 'src/views/tpls/', replacement: ''}]
                }
            }
        },
        sass            : {
            options       : {compass: true, bundleExec: true, sourcemap: 'file', trace: true},
            dev           : {
                //files: [{expand: true, cwd: 'src/styles', src: ['**/*.scss', '!stylesheet.scss'], ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
                files: [{expand: true, cwd: 'src/styles', src: ['components/select2.scss', 'themes/theme-default.scss', 'stylesheet.scss'], ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            dist          : {
                options: {style: 'compressed', sourcemap: 'none'},
                files  : [{expand: true, cwd: 'src/styles', src: ['components/select2.scss', 'themes/theme-default.scss', 'stylesheet.scss'], ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            fast          : {
                files: [{expand: true, cwd: 'src/styles', src: 'fast.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            nav           : {
                options: {loadPath: 'src/styles'},
                files  : [{expand: true, cwd: 'src/styles', src: 'nav.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            stylesheet_dev: {
                files: [{expand: true, cwd: 'src/styles', src: 'stylesheet.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            theme_dev     : {
                files: [{expand: true, cwd: 'src/styles', src: 'themes/theme-default.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            },
            json          : {
                files: [{expand: true, cwd: 'src/styles', src: 'json.scss', ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
            }
        },
        sassc           : {
            options: {
                sourceMap  : true,
                lineNumbers: true
            },
            dev    : {
                files: [{expand: true, cwd: 'src/styles', src: ['components/select2.scss', 'themes/theme-default.scss', 'stylesheet.scss'], ext: '.css', dest: '<%= target.dest %>/assets/styles'}]
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
            files  : ['<%= target.dest %>/*/*.html', '<%= target.dest %>/*.html']
        },
        availabletasks  : {
            tasks: {
                options: {
                    filter      : 'include',
                    tasks       : ['tasks', 'assets', 'build', 'cp', 'rm', 'scripts', 'templates', 'views', 'watcher'],
                    descriptions: {
                        'rm'       : 'Removes the dest dir',
                        'templates': 'Generates all javascript based templates',
                        'scripts'  : 'Generates all script assets',
                        'cp'       : 'Copies all files that do not require processing',
                        'assets'   : 'Generates all assets',
                        'views'    : 'Generates all views/html files',
                        'watcher'  : 'Acts upon file changes during development',
                        'build'    : 'Generates a full website build'
                    }
                }
            }
        },
        frontmatter     : {
            dev: {
                files: {
                    src: ['<%= target.dest %>/**/*.html', '!<%= target.dest %>/assets/**']
                }
            }
        },
        concurrent      : {
            options: {
                logConcurrentOutput: true
            },
            watch  : ['devtools', 'watch']
        },
        watch           : {
            options: {livereload: true}, //, nospawn: true},
            styles       : {
                files: ['src/styles/**'], // '!src/styles/fast/**', '!src/styles/fast.scss', '!src/styles/nav.scss', '!src/styles/components/_header-dropdown.scss'],
                tasks: ['sassc:dev'] //'sass:<%= target.name %>']
            },

            scripts_watch: {
                files: ['src/scripts/**/*.js', '!src/scripts/init.js', '!src/scripts/wrap-close.js', '!src/scripts/wrap-open.js'],
                tasks: ['copy:scripts_watch']
            },
            typescript: {
                files    : ['src/tscripts/**/*.ts', '!src/tscripts/app/**/*.ts', '!src/tscripts/packadic.ts', '!src/tscripts/**/*.d.ts'],
                tasks: ['typescript:amd']
            },
            initscripts  : {
                files: ['src/tscripts/app/**/*.ts', 'src/tscripts/packadic.ts', 'src/scripts/init.js', 'src/scripts/config.js', 'src/scripts/wrap-close.js', 'src/scripts/wrap-open.js'],
                tasks: ['tsbundler:packadic', 'copy:scripts_watch', 'create_init_script'] //'jsbuild:lodash', 'copy:scripts', 'uglify:dev',
            },

            views        : {
                files: ['src/views/**/*.jade', '!src/views/tpls/**', 'src/data/**', '!src/views/pages/**'],
                tasks: ['views'] //, 'bootlint' ]
            },
            views_pages  : {
                files: ['src/views/pages/**/*.jade'],
                tasks: ['jade_config', 'newer:jade:<%= target.name %>']
            },

            images    : {
                files: ['src/images/**'],
                tasks: ['clean:images', 'copy:images']
            },
            templates : {
                files: ['src/views/tpls/**/*.jade'],
                tasks: ['templates']
            },
            demo      : {
                files: ['src/demo/**'],
                tasks: ['clean:demo', 'copy:demo']
            },
            livereload: {
                options: {livereload: 35729},
                files  : ['src/**/*']
            },
        },
        jsdoc           : {
            dev: {
                options: {a: 'b'}
            }
        },
        init_script     : {
            src            : "<%= target.dest %>/assets/scripts",
            dest           : "/assets/scripts/init.js",
            prepend_scripts: [
                'plugins/lodash.custom.js',
                'plugins/require.js',
                //'plugins/eventemitter2/lib/eventemitter2.js',
                //'before.js',
                'packadic.js'
            ],
            append_scripts : [
                'config.js'
            ]
        },
        typescript      : {
            options : {
                target     : 'es5',
                rootDir    : 'src/tscripts',
                sourceMap  : false,
                declaration: false,
                module     : 'amd'
            },
            amd     : {
                src    : ['src/tscripts/**/*.ts', '!src/tscripts/app/**/*.ts', '!src/tscripts/packadic.ts', '!src/tscripts/**/*.d.ts'],
                dest   : '<%= target.dest %>/assets/scripts',
                options: {module: 'amd', declaration: false}
            },
            before: {
                src: ['src/tscripts/before.ts'],
                dest: 'src/scripts/before.js',
                options: { module: 'commonjs', removeComments: true }

            }
        },
        tsbundler       : {
            packadic: {
                options: {
                    name     : 'packadic',
                    dest     : '<%= target.dest %>/assets/scripts/packadic.js',
                    paths    : {
                        'async'        : 'src/plugins/async/lib/async',
                        'eventemitter2': 'src/plugins/eventemitter2/lib/eventemitter2'
                    },
                    modules  : [ 'app/application', 'app/autoloader', 'app/config', 'app/util', 'async','eventemitter2'],
                    startFile: "src/scripts/wrap-open.js",
                    endFile  : "src/scripts/wrap-close.js",
                    optimize : "none",
                    target   : 'ES5'
                }
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.loadTasks('tasks');
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);


    grunt.registerTask('rm', ['clean:all']);
    grunt.registerTask('templates', ['clean:templates', 'jade:templates', 'string-replace:templates', 'uglify:templates']);

    grunt.registerTask('cp', ['copy:images', 'copy:fonts', 'copy:misc', 'copy:demo']);

    grunt.registerTask('scripts', ['typescript:amd', 'tsbundler:packadic', 'copy:scripts', 'uglify:' + type, 'jsbuild', 'create_init_script']);
    grunt.registerTask('assets', ['clean:assets', 'cp', 'copy:plugins', 'sass:' + type, 'templates', 'scripts']);
    grunt.registerTask('views', ['clean:views', 'jade_config:' + type, 'jade:' + type]);

    grunt.registerTask('watcher', ['concurrent:watch']);
    grunt.registerTask('build', [
        'rm', 'cp',
        'sass:' + type, 'jade_config:' + type, 'jade:' + type,
        'assets'
    ]);


    grunt.registerTask('clean:scripts', function () {
        grunt.log.writeln(App.config.get('target.dest'));
        require('globule').find([App.config.get('target.dest') + '/assets/scripts/**', '!' + App.config.get('target.dest') + '/assets/scripts/plugins/**', App.config.get('target.dest') + '/assets/scripts/plugins/*/**']).forEach(function (delPath) {
            if ( fs.statSync(delPath).isFile() ) {
                fs.unlinkSync(delPath);
            }
        });
    });

    grunt.registerTask('tasks', 'Shows a list of custom tasks and their description, filtering out all individual tasks', function () {
        //grunt.log.writeflags();
        //grunt.initConfig(grunt.config.get());
        grunt.task.run(['availabletasks']);
    });

    grunt.event.on('task.start', function (a) {
        debug('task event', a);
    });
    grunt.event.on('task.done', function (a) {
        debug('task event', a);
    });



    grunt.registerTask('kill', function () {
        process.exit(1);
    });
};
