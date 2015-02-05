/* jshint camelcase: false */

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    jade   = require('jade'),
    lib    = require('../../');


module.exports = function(grunt ){
    'use strict';

    var opts = {
        options: {
            pretty: true,
            data  : lib.getJadeData
        },
        dev    : {
            options: {
                processContent: function( content ){
                    var colorize = require('pygments').colorize;
                    var matchEx = /\{%\shighlight\s(\w*)\s%\}([\w\W]*)\{%\sendhighlight\s%\}/;
                    var replaceEx = /\{%\shighlight\s[\w]*\s%\}[\w\W]*\{%\sendhighlight\s%\}/;

                    var matches = content.match(matchEx);
                    grunt.log.writeflags(matches);

                    return content;
                },
                filters       : {
                    code   : function( block ){
                        return block
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/#/g, '&#35;')
                            .replace(/\\/g, '\\\\');
                    },
                    actions: function( block ){
                        block = 'include src/views/base.jade\n' + block;
                        var compiled = jade.render(block, {
                            filename: 'base',
                            basedir: 'src/views'
                        } );
                        console.log(compiled);
                        return compiled;
                    },
                    body   : function( block ){
                        return block;
                    }
                }
            },
            files  : [
                {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: 'dev'}
            ]
        },
        tpls   : {
            options: {
                client   : true,
                pretty   : false,
                namespace: 'tpls'
            },
            files  : [
                {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: 'dev/assets/tpls'}
            ]
        }
    };

   return opts;
};
