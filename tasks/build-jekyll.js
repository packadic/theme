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


module.exports = function( grunt, configKeys ){


    grunt.registerMultiTask('my_awesome_task', function(){

        var options = {
            src : "https://raw.githubusercontent.com/ruyadorno/extend-grunt-plugin/master/index.js",
            dest: "testfile.js"
        };

        // Creates a "curl.getstuff" target on grunt, that can be run later
        extendGruntPlugin(grunt, require('grunt-curl'), {
            'curl.getstuff': options
        });

        // Runs the "curl:getstuff" subtask :)
        grunt.task.run('curl:getstuff');
    });
};
