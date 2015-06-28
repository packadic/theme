// here comes require.js and lodash.custom.js after build task
/*
 * INIT
 */
(function Init() {
    /**
     * @namespace packadic
     * @type {{}|*|Window.packadic}
     */
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

    /**
     * Attach an event handler to the pre-boot event
     * @param {function} cb
     * @returns {packadic}
     */
    packadic.onPreBoot = function(cb){
        packadic.bindEventHandler('pre-boot', cb);
        return packadic;
    };
    /**
     * Attach an event handler to the pre-boot event
     * @param {function} cb
     * @returns {packadic}
     */
    packadic.onBoot = function(cb){
        packadic.bindEventHandler('booting', cb);
        return packadic;
    };
    /**
     * Attach an event handler to the booted event
     * @param {function|Array} req - Either the callback or an array containing requireJS modules
     * @param {function} [cb]
     * @returns {packadic}
     * @example
     * packadic.onBooted(function(){
     *      console.log('yayy');
     * });
     * // or with dependencies
     * packadic.onBooted(['jquery', 'theme', 'plugins/something'], function($, theme){
     *      console.log('yay got dependencies aswell');
     *      $('body').hide();
     *      theme.on('resize', function(){
     *          console.log('reeeeesizeee');
     *      });
     * });
     */
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

    /**
     * Attach an event handler to the starting event
     * @param {function|Array} req - Either the callback or an array containing requireJS modules
     * @param {function} [cb]
     * @returns {packadic}
     */
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
    /**
     * Attach an event handler to the started event
     * @param {function|Array} req - Either the callback or an array containing requireJS modules
     * @param {function} [cb]
     * @returns {packadic}
     */
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

    /**
     * Adjusts the configuration by merging your object with the current. This should be done with onPreBoot, onBooted or before the boot.js file.
     * @param {object} newConfig - The config object that will be merged with the current
     * @returns {packadic}
     */
    packadic.mergeConfig = function (newConfig) {
        packadic.config = _.merge(packadic.config, newConfig);
        return packadic;
    }


}.call());

