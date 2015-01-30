/*
 * grunt-minscript-tpl
 *
 *
 * Copyright (c) 2014 Robin Radic
 * Licensed under the MIT license.
 */

'use strict';
var radic      = require('radic'),
    util       = radic.util,
    bin        = radic.binwraps,
    git        = radic.git,
    path       = require('path'),
    fs         = require('fs-extra'),
    async      = require('async'),
    _          = require('lodash'),
    glob       = require('glob'),
    globule    = require('globule'),
    rimraf     = require('rimraf'),
    preprocess = require('preprocess');


var uglify = require('uglify-js');

module.exports = function( grunt ){


    grunt.registerTask('highlightjs', 'Intialize the project', function( target ){
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options({
            include: [ '*' ],
            exclude: [ 'mel', 'glsl', 'apache', 'ruby', 'd', '1c' ],
            dir    : 'src/vendor/higlight-js/src',
            dest: 'dev/assets/scripts/highlightjs.pack.min.js'
        });

        var find = [];

        options.include.forEach(function( lang ){
            find.push(options.dir + '/languages/' + lang + '.js');
        });
        options.exclude.forEach(function( lang ){
            find.push('!' + options.dir + '/languages/' + lang + '.js');
        });
        find.push(options.include);
        find.push(options.exclude);


        var files = [
         //   options.dir + '/highlight.js'
        ];
        globule.find(['src/vendor/higlight-js/src/languages/*.js']).forEach(function( file ){
            grunt.log.ok(file);
            files.push(path.resolve(cwd, file));
        });


        var code = uglify.minify(files, {
            outSourceMap: null,
            sourceRoot  : null,
            inSourceMap : null,
            fromString  : false,
            warnings    : false,
            mangle      : {},
            output      : path.resolve(options.dest),
            compress    : {}
        });

        grunt.log.ok(code);

        process.chdir(cwd);


        taskDone();
    });


};
