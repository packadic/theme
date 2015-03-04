/*
 *  SCRIPT: INIT.JS
 *  INCLUDE BEFORE: lodash.custom.js, require.js
 */

(function Init(){

    var packadic = (window.packadic = window.packadic || {});

    packadic.start = new Date();

    packadic.__event_callbacks = {
        "booting" : [],     // before requirejs.config get initialised - before loading the primary dependencies
        "booted"  : [],     // after loading up RJS, got primary dependencies and booted up packadic base modules
        "starting": [],     // fires right after loading the theme and autoloader dependencies, before any other startup operation
        "started" : []      // fires after the theme module has been initialised and default autoloaders have been added
    };

    packadic.bindEventHandler = function( name, cb ){
        packadic.__event_callbacks[ name ].push(cb);
    };

    packadic.fireEvent = function( name ){
        if( !_.isObject(packadic.__event_callbacks[ name ]) ){
            return;
        }
        _.each(packadic.__event_callbacks[ name ], function( cb ){
            if( typeof cb === 'function' ){
                cb();
            }
        });
    };

    packadic.debug = function(){
    };
    packadic.log = function(){
    };

    packadic.mergeConfig = function( newConfig ){
        window.packadic.config = _.merge(window.packadic.config, newConfig);
    }


}.call());

(function Config(){

    var packadic = (window.packadic = window.packadic || {});
    packadic.config = {
        debug    : false,
        paths    : {
            assets : '/assets',
            images : '/assets/images',
            scripts: '/assets/scripts',
            fonts  : '/assets/fonts',
            styles : '/assets/styles'
        },
        requireJS: {}
    };

}.call());
/* ENDSCRIPT: INIT.JS */



/*
 *  SCRIPT: EXAMPLE CUSTOM CONFIG
 *  EXAMPLE  EXAMPLE EXAMPLE
 */
(function CustomConfig(){
    return;

    var packadic = (window.packadic = window.packadic || {});
    packadic.mergeConfig({
        debug    : false,
        paths    : {
            assets: '/files'
        },
        requireJS: {
            paths: {
                "mysupermod": "/files/myscripts/mymod"
            }
        }
    });

}.call());
// END Custom script



/*
 *  SCRIPT: BOOT.JS
 */
(function Boot(){

    var packadic = (window.packadic = window.packadic || {});

    packadic.fireEvent('booting'); // Fire "booting" event

    require.config(window.packadic.rjs);

    require([ 'module', 'jquery', 'lodash', 'string', 'jade', 'code-mirror', 'plugins/cookie' ],
        function( module, $, _, s, jade, config ){

            window.jade = jade;

            // SCSS Json
            var scss = s.unquote($('head').css('font-family'), "'");
            while( typeof scss !== 'object' ){
                scss = JSON.parse(scss);
            }
            packadic.config.scss = scss;

            // Debug
            if(packadic.config.debug !== true){
                var isDebug = false;
                if( typeof $.cookie('debug') !== 'undefined' ){
                    isDebug = parseInt($.cookie('debug')) === 1
                }
                $('#debug-enable').on('click', function(){
                    $.cookie('debug', '1');
                    window.location.href = window.location.href;
                });
                packadic.config.debug = isDebug;
            }

            // Startup, figure out what modules to load
            var load = [ 'autoloader', 'theme' ];
            if( packadic.config.debug === true ){
                load.push('debug');
            }
            if( packadic.config.demo === true ){
                load.push('demo');
            }

            // Create a temporary debug log function
           /* var logDebug = function(){
                var loadTime = (new Date()).getTime() - packadic.start.getTime();
                var args = [];
                args.push(loadTime / 1000);
                args.push($.makeArray(arguments));
                console.log(typeof args, args);
                console.debug.apply(console, args);
            };

            // @todo fix this to packadic only
            window.logDebug = window.logDebugEvent = packadic.log = packadic.debug = logDebug;
            */


            // EVENT: booted
            packadic.fireEvent('booted');

            require(load, function( autoloader, theme, debug, demo ){

                // EVENT: starting
                packadic.fireEvent('starting');

                theme.init();

                autoloader.on('detected', function(){ packadic.log('autoloader detected @ ' + autoloader.detected); });
                autoloader.on('loaded', function(){ packadic.log('autoloader loaded @ ' + autoloader.loaded); });
                autoloader.ready(function(){ packadic.log('autoloader ready'); $('body').removeClass('page-loading'); });
                autoloader.init();

                if( packadic.config.demo === true && _.isObject(demo) ){
                    demo.init();
                }

                // EVENT: started
                packadic.fireEvent('started');
            });
        });
}.call());
