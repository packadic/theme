module.exports = function( builderConfig, grunt ){
    var b = builderConfig;
    /*
     write front matter to index.html
     create _includes directory
     write _includes/_data/*.yml files from config
     */

    return {
        config        : b,
        tasks         : {
            'BNAME:clean'    : [ 'clean:all' ], // ok
            'BNAME:templates': [ 'clean:templates', 'jade:templates', 'string-replace:templates' ], // ok
            'BNAME:scripts'  : [ 'clean:scripts', 'copy:plugins', 'copy:scripts', 'BNAME:templates' ], //'uglify:', //ok
            'BNAME:copy'     : [ 'copy:images', 'copy:fonts', 'copy:misc', 'copy:demo' ], // ok
            'BNAME:assets'   : [ 'clean:assets', 'copy', 'BNAME:scripts', 'BNAME:jsbuild', 'copy:scripts', 'sass:BTYPE' ], // 'jsbuild',
            'BNAME:views'   :  [ 'clean:views', 'jade_layout:jekyll', 'jade:dev', 'frontmatter:main' ],
            'BNAME:fm'   :  [  'frontmatter:main' ],
            'BNAME:watch'   :  [ 'jade_layout:jekyll', 'watch' ],
            'BNAME:build'    : [
                'clean:all', 'BNAME:copy',
                'sass:BTYPE', 'jade:BTYPE',
                'BNAME:scripts', 'BNAME:jsbuild',
                'uglify:BTYPE'
            ]
        },
        watchers      : [
            'styles', 'scripts', 'views',
            'views_pages', 'images', 'templates',
            'vendor', 'demo', 'livereload'
        ],
        availabletasks: {
            tasks          : [ 'BNAME:clean', 'BNAME:templates', 'BNAME:scrips', 'BNAME:copy', 'BNAME:assets', 'BNAME:build', 'BNAME:watch' ],
            reporterOptions: {
                color: 'green'
            }
        },
        gruntConfig   : {
            watch: {
                frontmatter: {
                    files: ['<%= config.dest %>/**/*.html'],
                    tasks: ['frontmatter:main']
                }
            },
            frontmatter         : {
                main: {
                    options: {
                        layout: "page",
                        comments: true
                    },
                    src  : "<%= config.dest %>/index.html",
                    dest : "Welcome to my page"

                },
                alt: {
                    options: {
                        layout: "page",
                        comments: true
                    },
                    src: ['<%= config.dest %>/index.html', '<%= config.dest %>/components/*.html']
                }
            },
        }
    };

    //
};
