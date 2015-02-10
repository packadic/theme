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
    s             = require('underscore.string');

var lib = module.exports = function( lib ){
    require('./' + lib);
};

/**
 * @property
 * @type {{project: Function}}
 */
lib.path = {
    project: function(){
        return path.resolve.apply(path, [ __dirname, '..' ].concat(_.toArray(arguments)));
    }
};

/**
 *
 * @type {EventEmitter2}
 * @private
 */
lib._events = {};

radic.eventer(lib, {
    classOptions: {
        wildcard    : true,
        delimiter   : ':',
        newListener : true,
        maxListeners: 50
    },
    eventClass  : EventEmitter2,
    assignMethods: ['on', 'emit', 'once', 'off']
});

/**
 * @static
 * @returns {*}
 */
lib.getConfig = function(){
    return jsyaml.safeLoad(fs.readFileSync(lib.path.project('config.yml')));
};

/**
 * @memberOf lib
 * @returns {*}
 */
lib.getPackage = function(){
    return fse.readJSONFileSync(lib.path.project('package.json'));
};
lib.getBower = function(){
    return fse.readJSONFileSync(lib.path.project('bower.json'));
};
lib.getBowerRc = function(){
    return fse.readJSONFileSync(lib.path.project('.bowerrc'));
};
lib.getJshintRc = function(){
    return fse.readJSONFileSync(lib.path.project('.jshintrc'));
};
lib.getTravis = function(){
    return jsyaml.safeLoad(fs.readFileSync(lib.path.project('.travis.yml')));
};

lib.build = function(name, grunt){
    options = options || { builders: ['dev'] };
    lib._events.emit('prebuild', name, options);
    var config = lib.getConfig();
    var Builder = lib('./build/' + name);
    lib._events.emit('postbuild', name, options);
};

/**
 * @method validateConfig
 * @param config {object}
 */
lib.validateConfig = function(config){
    if( _.isUndefined(config)){
        config = lib.getConfig();
    }
    var validate = lib('validate-config');
};


// test stuff if script is invoked directly
if( !module.parent ){
    //radic.util.log('lib', lib);
    var c = {
        config  : lib.getConfig(),
        package : lib.getPackage(),
        bower   : lib.getBower(),
        bowerrc : lib.getBowerRc(),
        jshintrc: lib.getJshintRc(),
        travis  : lib.getTravis()
    };
    //radic.util.log('config', c);
    lib.on('a', function(){
        console.log('a fired');
    });
    lib.emit('a');
}



if( !module.parent ){



    var config = lib.getConfig();

    var validate = require('./build/validate-config')([
        {name: 'dev'}
    ]);

    console.log(validate(config));

    console.log(validate.errors);

    //console.log(validate.toJSON());
}
