/*
 *  BOOTING UP SHIT
 */

(function Boot(){

    var packadic = (window.packadic = window.packadic || {});

    packadic.fireEvent('pre-boot');

    require.config(packadic.config.requireJS);

    packadic.fireEvent('booting'); // Fire "booting" event

    require([ 'module', 'jquery',  'autoload', 'string', 'jade', 'config', 'code-mirror', 'plugins/cookie' ],
        function( module, $, autoload, s, jade, config ){

            packadic.removePageLoader = function(){
                $('body').removeClass('page-loading');
            };

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
                    window.location.refresh();
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



            // EVENT: booted
            packadic.fireEvent('booted');

            require(load, function( theme, debug, demo ){

                // EVENT: starting
                packadic.fireEvent('starting');

                if( packadic.config.demo === true && _.isObject(demo) ){
                    demo.init();
                }

                // EVENT: started
                packadic.fireEvent('started');

            });
        });
}.call());
