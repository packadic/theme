require.config(window.packadic.rjs);

require([ 'module', 'jquery', 'lodash', 'string', 'jade', 'config', 'code-mirror', 'plugins/cookie' ],
    function( module, $, _, s, jade, config ){


        window.jade = jade;
        window.packadic = _.merge(window.packadic, config);

        packadic = _.merge(window.packadic, {
            module : module,
            editors: {}
        });

        var scss = s.unquote($('head').css('font-family'), "'");

        while( typeof scss !== 'object' ){
            scss = JSON.parse(scss);
        }

        var isDebug = false;
        if( typeof $.cookie('debug') !== 'undefined' ){
            isDebug = parseInt($.cookie('debug')) === 1
        }
        $('#debug-enable').on('click', function(){
            $.cookie('debug', '1');
            window.location.href = window.location.href;
        });

        window.packadic.merge({
            debug  : isDebug,
            demo   : true,
            scss   : scss,
            sidebar: {
                togglerClosedIcon: 'fa-long-arrow-right',
                togglerOpenedIcon: 'fa-long-arrow-left'
            }
        });

        var load = [ 'autoloader', 'theme' ];
        if( config.demo === true ){
            load.push('demo');
        }
        if( config.debug === true ){
            load.push('debug');
        }

        window.logDebug = window.logDebugEvent = function(){
            var loadTime = (new Date()).getTime() - window.packadic.start.getTime();
            var args = [];
            args.push(loadTime / 1000);
            args.push($.makeArray(arguments));
            console.log(typeof args, args);
            console.debug.apply(console, args);
        };


        require(load, function( autoloader, theme, demo ){
            window.packadic.autoloader = autoloader;
            window.packadic.theme = theme;
            window.packadic.demo = demo;
            theme.init({
                sidebarItems: window.packadic.site.data.navigation.sidebar
            });
            autoloader.on('detected', function(){
                logDebug('autoloader detected @ ' + autoloader.detected);
            });
            autoloader.on('loaded', function(){
                logDebug('autoloader loaded @ ' + autoloader.loaded);
            });
            autoloader.ready(function(){
                logDebug('autoloader ready');
                $('body').removeClass('page-loading');
            });

            _.each(window.packadic.__onLoadedCallbacks, function(cb){
                //require.load()
                if(_.isFunction(cb)){
                 //   console.log('cb is a func', cb);
                    cb();
                }
            });


            autoloader.init();
            if( config.demo === true ){
                demo.init();
            }
        });
    });
