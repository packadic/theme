/* jshint camelcase: false */
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
    jsyaml     = require('js-yaml'),
    globule    = require('globule'),
    rimraf     = require('rimraf'),
    preprocess = require('preprocess');


var lib = exports;

lib.getJadeData = function(){
    function getyml( fileName ){
        return jsyaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../src/data', fileName + '.yml'), 'utf-8'));
    }

    var site = getyml('site');
    site.data = {};
    [ 'navigation', 'author', 'main', 'social', 'widgets', 'theme' ].forEach(function( fileName ){
        site.data[ fileName ] = getyml(fileName);
    });
    return {site_json: JSON.stringify(site), site: site};
};


lib.getMiddleware = function(){
    var args = _.toArray(arguments);
    var name = args.splice(0, 1);
    return require('./middlewares')[ name ].apply(lib, args);
};
