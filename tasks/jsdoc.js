'use strict';
var path    = require('path'),
    util    = require('util'),
    _       = require('lodash'),
    fs      = require('fs-extra'),
  //  jd      = require('jsdoc/jsdoc'),
    globule = require('globule');

var log = function () {
        _.toArray(arguments).forEach(function (vl) {
            process.stdout.write(util.inspect(vl, {hidden: true, depth: 5, colors: true}) + "\n")
        })
    },
    dd  = function () {
        log.apply(log, _.toArray(arguments));
        process.exit()
    };

function requizzleIt() {
    require = require('../node_modules/jsdoc/node_modules/requizzle')({
        requirePaths: {
            before: [path.join(process.cwd(), 'node_modules/jsdoc/lib')],
            after : [path.join(process.cwd(), 'node_modules/jsdoc/node_modules')]
        },
        infect      : true
    });
}

module.exports = function (grunt) {

    grunt.registerMultiTask('jsdoc', 'Generate JSDoc documentation', function () {
        grunt.event.emit('task.start', 'jsdoc');
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        requizzleIt();
        var logger = require('../node_modules/jsdoc/lib/jsdoc/util/logger');
        var runtime = require('../node_modules/jsdoc/lib/jsdoc/util/runtime');
        var cli = require('../node_modules/jsdoc/cli');
        grunt.event.emit('task.done', 'jsdoc');
        taskDone();
    });
};
