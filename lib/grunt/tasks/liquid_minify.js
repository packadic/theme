/*
 * grunt-minscript-tpl
 *
 *
 * Copyright (c) 2014 Robin Radic
 * Licensed under the MIT license.
 */

'use strict';
var radic = require('radic'),
    util = radic.util,
    path = require('path'),
    fs = require('fs-extra'),
    async = require('async'),
    _ = require('lodash');

function minifyLiquid(html){
    var options = {
        removeComments: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        collapseWhitespace: true,
        customAttrSurround: [
            [ /\{%\s+for\s.*?%\}/, /\{%\s+endfor\s.*?%\}/ ],
            [ /\{%\s+if\s.*?%\}/, /\{%\s+endif\s.*?%\}/ ],
            [ /\{%\s+capture\s.*?%\}/, /\{%\s+endcapture\s.*?%\}/ ]
        ]
    };

    return minify(html, options);
}

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('liquid_minify', 'The best Grunt plugin ever.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            punctuation: '.',
            separator: ', '
        });

        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            // Concat specified files.
            var src = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function (filepath) {
                // Read file source.
                return grunt.file.read(filepath);
            }).join(grunt.util.normalizelf(options.separator));

            // Handle options.
            src += options.punctuation;


            // Write the destination file.
            grunt.file.write(f.dest, minifyLiquid(src));

            // Print a success message.
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

};
