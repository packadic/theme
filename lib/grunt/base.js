var radic         = require('radic'),
    util          = radic.util,
    path          = require('path'),
    fse           = require('fs-extra'),
    fs            = require('fs'),
    async         = require('async'),
    _             = require('lodash'),
    jsyaml        = require('js-yaml'),
    globule       = require('globule'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    rimraf        = require('rimraf'),
    preprocess    = require('preprocess'),
    jade          = require('jade'),
    marked        = require('marked'),
    marktoc       = require('markdown-toc'),
    uglify        = require('uglify-js'),
    tmp           = require('tmp'),
    _s            = require('underscore.string');


module.exports.Config = Config;
module.exports.ServiceProvider = ServiceProvider;

function Config(grunt){
    this.grunt = grunt;
    this.events = grunt.events;
}
var config = Config.prototype;

config.config = function(){

    return this;
};

config.merge = function(){

    return this;
};

config.init = function(){

};

function ServiceProvider( grunt ){
    this.events = radic.eventer.get();
    this.grunt = grunt;
    this.config = new Config(grunt);
    this._init = function(){

    }
}

var sp = ServiceProvider.prototype;

ServiceProvider.inherit = function( target ){
    util.inherit(target, ServiceProvider);
};

sp.register = function(){

};

sp.bower = function(){

};

sp.pkg = function(){

};
