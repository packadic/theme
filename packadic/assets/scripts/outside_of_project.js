(function(){


    var packadic = (window.packadic = window.packadic || {});
    packadic.mergeConfig({
        debug: true,
        demo : true
    });

    packadic.bindEventHandler('booting', function(){
        console.info('(demo outside of project) event handler - BOOTING');
    });
    packadic.bindEventHandler('booted', function(){
        console.info('(demo outside of project) event handler - BOOTED');
    });
    packadic.bindEventHandler('starting', function(){
        console.info('(demo outside of project) event handler - STARTING');
    });
    packadic.bindEventHandler('started', function(){
        console.info('(demo outside of project) event handler - STARTED');
        require([ 'theme/sidebar' ], function( sidebar ){
            sidebar.init(packadic.site.data.navigation.sidebar);
        })
    });

}.call());
