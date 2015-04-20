(function(){

    var packadic = (window.packadic = window.packadic || {});

    packadic.mergeConfig({
        debug: true,
        demo : true,
        oauth_io: 'UpFevf23G2O93iSlMOQ5PRL4zq0'
    });

    packadic.bindEventHandler('pre-boot', function(){
        console.warn('(' + packadic.getElapsedTime() + 's) PRE-BOOT');
    });

    packadic.bindEventHandler('booting', function(){
        console.warn('(' + packadic.getElapsedTime() + 's) BOOTING');
    });

    packadic.bindEventHandler('booted', function(){
        console.warn('(' + packadic.getElapsedTime() + 's) BOOTED');

        require(['theme', 'theme/sidebar'], function(theme, sidebar){
            theme.init();
            sidebar.init({ hidden: false, items: packadic.site.data.navigation.sidebar });
        });

        require(['autoload'], function(autoload){
            autoload.scan($('body'), function(){
                if(packadic.config.pageLoadedOnAutoloaded === true){
                    packadic.removePageLoader();
                }
            });
        });
    });

    packadic.bindEventHandler('starting', function(){
        console.warn('(' + packadic.getElapsedTime() + 's) STARTING');

    });

    packadic.bindEventHandler('started', function(){
        console.warn('(' + packadic.getElapsedTime() + 's) STARTED');
    });

}.call());
