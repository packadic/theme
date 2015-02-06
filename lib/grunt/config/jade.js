/* jshint camelcase: false */

var radic  = require('radic'),
    _      = require('lodash'),
    jsyaml = require('js-yaml'),
    fs     = require('fs-extra'),
    path   = require('path'),
    jade   = require('jade'),
    lib    = require('../../');


module.exports = function( config, grunt, target, dir ){
    'use strict';
    target = target || 'dev';
    dir = dir || 'dev';

    var opts = {
        options: {
            pretty: true,
            data  : lib.getJadeData
        }
    };
    opts[ target ] = {
        options: {
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
            {expand: true, cwd: 'src/views/pages', src: '**/*.jade', ext: '.html', dest: dir}
        ]
    };
    opts[ target + '_tpls' ] = {
        options: {
            client   : true,
            pretty   : false,
            namespace: 'tpls'
        },
        files  : [
            {expand: true, cwd: 'src/views/tpls', src: '**/*.jade', ext: '.js', dest: dir + '/assets/tpls'}
        ]
    };

    config = _.merge(config, { jade: opts });

    return config;
};
