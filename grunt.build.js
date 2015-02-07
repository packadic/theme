var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),

    lib    = require('./lib');


module.exports = function( config, grunt, build ){

    var name = build.name;
    var dir = build.dir;

    function getJadeData(){
        function getyml( fileName ){
            return jsyaml.safeLoad(fs.readFileSync(path.resolve(__dirname, 'src/data', fileName + '.yml'), 'utf-8'));
        }

        var site = getyml('site');
        site.data = {};
        [ 'navigation', 'author', 'main', 'social', 'widgets', 'theme' ].forEach(function( fileName ){
            site.data[ fileName ] = getyml(fileName);
        });
        return {site_json: JSON.stringify(site), site: site};
    }

    var tmp = {
        build           : build,
        clean           : {
            '<%= build.name %>': {src: '<%= build.dir %>/*'}

        },
        copy            : {
            '<%= build.name %>': {
                files: [
                    {expand: true, cwd: 'src/vendor/bootstrap/fonts', src: '**', dest: '<%= build.dir %>/assets/fonts'},
                    {expand: true, cwd: 'src/vendor/font-awesome/fonts', src: '**', dest: '<%= build.dir %>/assets/fonts'},
                    {expand: true, cwd: 'src/images', src: '**', dest: '<%= build.dir %>/assets/images'},
                    {expand: true, cwd: 'src/vendor', src: '**', dest: '<%= build.dir %>/assets/vendor'},
                    {src: 'src/.htaccess', dest: '<%= build.dir %>/.htaccess'}
                ]
            }
        },
        uglify          : {
            '<%= build.name %>'        : {
                files: {
                    '<%= build.dir %>/assets/vendor/modernizr.min.js' : [ 'src/vendor/modernizr/modernizr.js' ],
                    '<%= build.dir %>/assets/vendor/bootbox.min.js'   : [ 'src/vendor/bootbox/bootbox.js' ],
                    '<%= build.dir %>/assets/vendor/mscrollbar.min.js': [ 'src/vendor/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.js' ],
                    '<%= build.dir %>/assets/vendor/require.min.js'   : [ 'src/vendor/requirejs/require.js' ]
                }
            },
            '<%= build.name %>_scripts': {
                files: [ {
                             expand: true,
                             cwd   : 'src/scripts',
                             src   : '**/*.js',
                             dest  : '<%= build.dir %>/assets/vendor/packadic'
                         } ]
            }
        },
        'string-replace': {
            '<%= build.name %>_tpls': {
                files  : {
                    '<%= build.dir %>/assets/tpls/': '<%= build.dir %>/assets/tpls/**'
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

        sass   : {

            '<%= build.name %>': {
                options: {
                    style: 'compressed'
                },
                files  : [
                    {expand: true, cwd: 'src/styles', src: '*.scss', ext: '.css', dest: '<%= build.dir %>/assets/styles'}
                ]
            }
        },
        cssmin : {
            '<%= build.name %>': {
                expand: true,
                cwd   : '<%= build.dir %>/assets/styles/',
                src   : [ '*.css', '!*.min.css' ],
                dest  : '<%= build.dir %>/assets/styles/',
                ext   : '.css'
            }
        },
        htmlmin: {
            '<%= build.name %>': {
                options: {
                    removeComments    : true,
                    collapseWhitespace: true
                },
                files  : [ {
                               expand: true,
                               cwd   : '<%= build.dir %>',
                               src   : [ '**/*.html', '!assets/**' ],
                               dest  : '<%= build.dir %>'
                           } ]
            }
        },
        jade   : {
            options                 : {
                pretty: true
            },
            '<%= build.name %>'     : {
                options: {
                    data   : getJadeData,
                    filters: {
                        code: function( block ){
                            return block
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/#/g, '&#35;')
                                .replace(/\\/g, '\\\\');
                        }
                    }
                },
                files  : [
                    {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: '<%= build.dir %>'}
                ]
            },
            '<%= build.name %>_tpls': {
                options: {
                    client   : true,
                    pretty   : false,
                    namespace: 'tpls'
                },
                files  : [
                    {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: '<%= build.dir %>/assets/tpls'}
                ]
            }

        }
    };

    // replace target names and merge with options
    var options = {};
    _.each(tmp, function( opt, key ){
        options[ key ] = {};
        _.each(opt, function( op, target ){
            options[ key ][ target.replace('<%= build.name %>', name) ] = op;
        })
    });
    config = _.merge(config, options);

    // mixin jsbuild for this build
    config = require('./lib/grunt/config/jsbuild')(config, grunt, name, dir);


    grunt.registerTask(name + ':build', [
        'clean:' + name, 'copy:' + name, // clean all, copy images, fonts, vendor
        'sass:' + name, // sass to css compressed
        'jade:' + name, 'jade:' + name + '_tpls', 'string-replace:' + name + '_tpls', // jade views and runtime javascript views (rename selector)
        'uglify:' + name + '_scripts', // minify src/scripts to assets/scripts
        'uglify:' + name, name + ':jsbuild' // minify some vendor scripts to vendor/ and custom build jquery, lodash and bootstrap
    ]);

    return config;
};
