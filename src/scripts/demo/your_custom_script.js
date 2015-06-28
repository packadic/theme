(function () {

    var packadic = (window.packadic = window.packadic || {});

    // To alter any config value before booting, use the mergeConfig function.
    packadic.mergeConfig({
        debug: true
    });

    // Use the onBooted function to create callbacks to be executed when booted.
    packadic.onBooted(['jquery', 'theme', 'theme/sidebar', 'autoload'], function ($, theme, sidebar, autoload) {
        theme.init();
        sidebar.init({hidden: false});
        $(function () {
            autoload.scan($('body'), function () {
                if ( packadic.config.pageLoadedOnAutoloaded === true ) {
                    packadic.removePageLoader();
                }
            });
        });
    });

    // Alternatively, there are several other events that you can bind callbacks to
    // onPreBoot, onBoot, onBooted, onStart and onStarted

    // This is the place to load your scripts, adjust configurations, add autoloading plugins, etc..

}.call());
