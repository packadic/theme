(function(){


    var packadic = (window.packadic = window.packadic || {});
    packadic.mergeConfig({
        debug: true,
        demo : true,
        oauth_io: 'UpFevf23G2O93iSlMOQ5PRL4zq0'
    });

    packadic.bindEventHandler('booting', function(){
        console.info('(demo outside of project) event handler - BOOTING');
    });
    packadic.bindEventHandler('booted', function(){
        console.info('(demo outside of project) event handler - BOOTED');
        require(['theme', 'theme/sidebar'], function(theme, sidebar){
            theme.init();
            sidebar.init({ hidden: false, items: packadic.site.data.navigation.sidebar });
        })
    });
    packadic.bindEventHandler('starting', function(){
        console.info('(demo outside of project) event handler - STARTING');
    });
    packadic.bindEventHandler('started', function(){
        console.info('(demo outside of project) event handler - STARTED');
    });

}.call());
