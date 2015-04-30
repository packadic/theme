(function () {

    var packadic = (window.packadic = window.packadic || {});

    packadic.mergeConfig({
        debug   : true,
        demo    : true,
        oauth_io: 'UpFevf23G2O93iSlMOQ5PRL4zq0'
    }).onPreBoot(function () {
        console.warn('(' + packadic.getElapsedTime() + 's) PRE-BOOT');
    }).onBoot(function () {
        console.warn('(' + packadic.getElapsedTime() + 's) BOOTING');
    }).onBooted(['jquery', 'theme', 'theme/sidebar', 'autoload'], function ($, theme, sidebar, autoload) {
        console.warn('(' + packadic.getElapsedTime() + 's) BOOTED');
        theme.init();
        sidebar.init({hidden: false, items: packadic.site.data.navigation.sidebar});
        autoload.scan($('body'), function () {
            if (packadic.config.pageLoadedOnAutoloaded === true) {
                packadic.removePageLoader();
            }
        });
    }).onStart(function () {
        console.warn('(' + packadic.getElapsedTime() + 's) STARTING');
    }).onStarted(function () {
        console.warn('(' + packadic.getElapsedTime() + 's) STARTED');
    });
    packadic.onBooted(['jquery', 'demo/component-editor', 'demo/metro'], function ($, ComponentEditor) {
        var layoutEditor = window.ceditors = new ComponentEditor($('#layout-editor'), {
            target   : '#layout-editor',
            editables: [{
                id: 'section-top-toggle', name: 'Display top', 'default': true, type: 'switch', options: {
                    isEnabled  : function(){ return $('body').hasClass('without-section-top') === false; },
                    toggle : function(){
                        console.log('toggle', 'is enabled', this.isEnabled());
                        $('body')[ (this.isEnabled() ? 'add' : 'remove') + 'Class']('without-section-top')
                    }
                }
            }, {
                id: 'page-boxed', name: 'Boxed page', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return window.theme.opts['layout-option'] === 'boxed' },
                    toggle : function(){
                        console.log('toggle', 'is enabled', this.isEnabled());
                        window.theme.opts['layout-option'] = window.theme.opts['layout-option'] === 'boxed' ? 'fluid' : 'boxed';
                        window.theme.apply();
                    }
                }
            }, {
                id: 'header-fixed', name: 'Fixed header', 'default': true, type: 'switch', options: {
                    isEnabled  : function(){ return window.theme.opts['page-header-option'] === 'fixed' },
                    toggle : function(){
                        console.log('header fix', 'is enabled', this.isEnabled());
                        window.theme.opts['page-header-option'] = window.theme.opts['page-header-option'] === 'fixed' ? 'default' : 'fixed';
                        window.theme.apply();
                    }
                }
            }, {
                id: 'footer-fixed', name: 'Fixed footer', 'default': true, type: 'switch', options: {
                    isEnabled  : function(){ return window.theme.opts['page-footer-option'] === 'boxed' },
                    toggle : function(){
                        console.log('footer fix', 'is enabled', this.isEnabled());
                        window.theme.opts['page-footer-option'] = window.theme.opts['page-footer-option'] === 'fixed' ? 'default' : 'fixed';
                        window.theme.apply();
                    }
                }
            }, {
                id: 'sidebar-fixed', name: 'Fixed sidebar', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return window.theme.opts['sidebar-option'] === 'boxed' },
                    toggle : function(){
                        console.log('sidebar fix', 'is enabled', this.isEnabled());
                        window.theme.opts['sidebar-option'] = window.theme.opts['sidebar-option'] === 'fixed' ? 'default' : 'fixed';
                        window.theme.apply();
                    }
                }
            } ]
        })


    });
}.call());
