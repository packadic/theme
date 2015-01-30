
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

var rewriteModule = require('http-rewrite-middleware');

var middlewares = exports;


middlewares.rewrite = function(){
    var rewriteRules = [];
    var seen = {};

    function loopMenuItems(menuItems){
        _.each(menuItems, function(item){
            if(typeof item.href === 'string' && item.href !== '#' && item.href !== '/' && item.href.indexOf('http') === -1 && typeof seen[item.href] === 'undefined'){
                rewriteRules.push({
                    from: '^' +  item.href + '$',
                    to: item.href + '.html'
                });
                seen[item.href] = true;
            }
            if(typeof item.children !== 'undefined'){
                loopMenuItems(item.children);
            }
        });
    }

    _.each(this.getJadeData().site.data.navigation, function(menuItems){
        loopMenuItems(menuItems);
    });

    var rewriteOptions = { verbose: true };

    return rewriteModule.getMiddleware(rewriteRules, rewriteOptions);
};

middlewares.pygments = function(){
    return function( req, res, next ){
        fs.outputFileSync(path.resolve(__dirname, 'temp.data'), util.inspect(res));
        next();
    };
};

