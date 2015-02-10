'use strict';
var radic      = require('radic'),
    util       = radic.util,
    path       = require('path'),
    fs         = require('fs-extra'),
    async      = require('async'),
    _          = require('lodash'),
    jsyaml     = require('js-yaml'),
    globule    = require('globule'),
    rimraf     = require('rimraf'),
    preprocess = require('preprocess'),
    jade       = require('jade'),
    marked     = require('marked'),
    marktoc    = require('markdown-toc'),
    uglify     = require('uglify-js'),
    s          = require('underscore.string'),
    lib        = require('lib');


module.exports = function( grunt ){


    return;


    function buildConfig(taskName, config){
        grunt.registerTask(taskName, function(){
            _.merge(grunt.config, config);
        });
    }



    grunt.registerTask('dev:templates', 'creates dev/scripts/templates | pre-compiled jade templates for browser useage.',
        [ 'clean:dev_templates', 'jade:dev_templates', 'string-replace:templates' ]);

    grunt.registerTask('dev:scripts', 'copy src/plugins > dev/scripts/plugins, minifies [require.js,modernizr.js,bootbox.js,mscrollbar.js] to dev/scripts/plugins, copy src/scripts/* > dev/assets/scripts',
        ['clean:dev_scripts', 'copy:dev_plugins', 'uglify:dev', 'copy:dev_scripts', 'dev:templates']);

    grunt.registerTask('dev:copy', 'copies src/{.htaccess,images,fonts,demo} to dev/assets/',
        [ 'copy:dev_images', 'copy:dev_fonts', 'copy:dev_misc', 'copy:dev_demo' ]);

    grunt.registerTask('dev:assets', 'copies src/{.htaccess,images,fonts,demo} to dev/assets/',
        [ 'clean:dev_assets', 'dev:copy', 'dev:scripts', 'dev:jsbuild', 'copy:dev_scripts', 'sass:dev' ]);

    grunt.registerTask('dev:build', 'create a working development build in dev/', [
        'clean:dev', 'dev:copy',
        'sass:dev', 'jade:dev',
        'dev:scripts', 'dev:jsbuild',
        'copy:dev_scripts', 'uglify:dev'
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
