/*
 *  BOOTING UP SHIT
 */
(function Boot(){

    var packadic = (window.packadic = window.packadic || {});

    packadic.fireEvent('booting'); // Fire "booting" event

    require.config(packadic.config.requireJS);

    require([ 'module', 'jquery',  'autoloader', 'string', 'jade', 'config', 'code-mirror', 'plugins/cookie' ],
        function( module, $, autoloader, s, jade, config ){

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
            var load = ['theme' ];
            if( packadic.config.debug === true ){
                load.push('debug');
            }
            if( packadic.config.demo === true ){
                load.push('demo');
            }

            autoloader.on('detected', function(){ packadic.log('autoloader detected @ ' + autoloader.detected); });
            autoloader.on('loaded', function(){ packadic.log('autoloader loaded @ ' + autoloader.loaded); });
            autoloader.ready(function(){ packadic.log('autoloader ready'); $('body').removeClass('page-loading'); });


            // EVENT: booted
            packadic.fireEvent('booted');

            require(load, function( theme, debug, demo ){

                // EVENT: starting
                packadic.fireEvent('starting');

                if( packadic.config.demo === true && _.isObject(demo) ){
                    demo.init();
                }

                autoloader.init();
                // EVENT: started
                packadic.fireEvent('started');
               // $('body').removeClass('page-loading');
            });
        });
}.call());
