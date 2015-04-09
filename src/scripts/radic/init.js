(function(){


    var packadic = (window.packadic = window.packadic || {});
    packadic.mergeConfig({
        debug: true,
        demo : true
    });

    packadic.bindEventHandler('booting', function(){

    });
    packadic.bindEventHandler('booted', function(){

        require(['theme', 'theme/sidebar'], function(theme, sidebar){
            theme.init();
            sidebar.init({hidden:false, items: packadic.site.data.navigation['sidebar-radic'] });
        })
    });
    packadic.bindEventHandler('starting', function(){

    });
    packadic.bindEventHandler('started', function(){

    });

}.call());
