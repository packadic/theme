// here comes require.js and lodash.custom.js after build task
/*
 * INIT
 */
(function Init() {
    var packadic = (window.packadic = window.packadic || {});

    if(!_.isObject(packadic.config)){
        packadic.config = {};
    }
    packadic.state = 'pre-boot';
    packadic.start = Date.now();
    packadic.__events_fired = [];
    packadic.__event_callbacks = {
        "pre-boot": [],     // before requirejs.config get initialised - before loading the primary dependencies
        "booting" : [],     // after loading up require.js config, before the first require() call
        "booted"  : [],     // after the first require() call when primary dependencies are loaded and booted up packadic base modules
        "starting": [],     // fires right after loading the theme and autoloader dependencies, before any other startup operation
        "started" : []      // fires after the theme module has been initialised and default autoloaders have been added
    };

    packadic.getElapsedTime = function () {
        return (Date.now() - packadic.start) / 1000;
    };

    packadic.bindEventHandler = function (name, cb) {
        if (packadic.__events_fired.indexOf(name) !== -1) {
            return cb();
        }
        packadic.__event_callbacks[name].push(cb);
        return packadic;
    };

    packadic.onPreBoot = function(cb){
        packadic.bindEventHandler('pre-boot', cb);
        return packadic;
    };
    packadic.onBoot = function(req, cb){
        packadic.bindEventHandler('booting', cb);
        return packadic;
    };
    packadic.onBooted = function(req, cb){
        packadic.bindEventHandler('booted', function(){
            if(_.isFunction(req)){
                req();
            } else {
                require(req, cb);
            }
        });
        return packadic;
    };
    packadic.onStart = function(req, cb){
        packadic.bindEventHandler('starting', function(){
            if(_.isFunction(req)){
                req();
            } else {
                require(req, cb);
            }
        });
        return packadic;
    };
    packadic.onStarted = function(req, cb){
        packadic.bindEventHandler('started', function(){
            if(_.isFunction(req)){
                req();
            } else {
                require(req, cb);
            }
        });
        return packadic;
    };

    packadic.fireEvent = function (name) {
        if (!_.isObject(packadic.__event_callbacks[name])) {
            return;
        }
        _.each(packadic.__event_callbacks[name], function (cb) {
            if (typeof cb === 'function') {
                cb();
            }
        });
        packadic.state = name;
        packadic.__events_fired.push(name);
        return packadic;
    };


    packadic.debug = function () {
    };
    packadic.log = function () {
    };

    packadic.mergeConfig = function (newConfig) {
        packadic.config = _.merge(packadic.config, newConfig);
        return packadic;
    }


}.call());

