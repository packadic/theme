/*
 * grunt-minscript-tpl
 *
 *
 * Copyright (c) 2014 Robin Radic
 * Licensed under the MIT license.
 */

'use strict';
var path = require('path'),

    radic = require('radic'),
    util = radic.util,


    sh = radic.sh,

    fs = require('fs-extra'),
    async = require('async'),
    _ = require('lodash');


module.exports = function (grunt) {

    grunt.registerTask('serve2', 'Starts local jekyll serve.', function () {
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options({
            githubToken: '47ffa034ce0d4fcdd4464fe210f63cb36882c971'
        });

        var jekyll = radic.binwraps.create('jekyll');
        grunt.log.writeln(sh.inlineScript('export JEKYLL_GITHUB_TOKEN="' + options.githubToken + '" \n\
        cd dev \n\
        jekyll serve --watch'
        ).stdout);

        taskDone();
    });

};
