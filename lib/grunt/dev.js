var ServiceProvider = require('base').ServiceProvider;

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

module.exports = function(grunt){
    function Dev(){
        this._init(this);
        this.config({
            clean: {}
        }).override();
    }
    this.Dev = Dev;
    var dev = Dev.prototype;
};
