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

    // Create layout settings editor for demo
    packadic.onStart(['jquery', 'theme/settings-editor', 'theme', 'storage'], function ($, SettingsEditor, theme, storage) {
        var shouldSave = function(){
            return storage.get('demo.layout.editor.save', {default: false}) == "true";
        };


        var layoutEditor = window.ceditors = new SettingsEditor($('#layout-editor'), {
            target   : '#layout-editor',
            controls: [{
                id: 'persistent-save', name: 'Save adjustments', 'default': false, type: 'switch', options: {
                    isEnabled  : shouldSave,
                    toggle : function(event, val){
                        storage.set('demo.layout.editor.save', val);
                    }
                }
            },{
                id: 'top', name: 'Top', 'default': theme.get('section-top'), type: 'select', options: {
                    choices: {
                        'hidden'  : { name: 'Hidden'},
                        'normal': { name: 'Normal'},
                        fixed    : { name: 'Fixed'}
                    },
                    onChange: function($el){
                        theme.set('section-top', $el.val(), true, shouldSave())
                    }
                }
            }, {
                id: 'page-boxed', name: 'Boxed Layout', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return theme.get('layout-option') === 'boxed' },
                    toggle : function(event, val){
                        theme.set('layout-option', val ? 'boxed' : 'fluid', true, shouldSave());
                    }
                }
            }, {
                id: 'footer-fixed', name: 'Fixed Bottom', 'default': true, type: 'switch', options: {
                    isEnabled  : function(){ return theme.get('section-bottom') === 'fixed' },
                    toggle : function(event, val){
                        theme.set('section-bottom', val ? 'fixed' : 'default', true, shouldSave());
                    }
                }
            }, {
                id: 'sidebar-fixed', name: 'Fixed Sidebar', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return theme.get('sidebar-option') === 'fixed' },
                    toggle : function(event, val){
                        theme.set('sidebar-option', val ? 'fixed' : 'default', true, shouldSave());
                    }
                }
            }, {
                id: 'sidebar-style', name: 'Light Sidebar', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return theme.get('sidebar-option') === 'light' },
                    toggle : function(event, val){
                        theme.set('sidebar-style', val ? 'light' : 'default', true, shouldSave());
                    }
                }

            }, {
                id: 'sidebar-menu', name: 'Sidebar Hover', 'default': false, type: 'switch', options: {
                    isEnabled  : function(){ return theme.get('sidebar-menu') === 'hover' },
                    toggle : function(event, val){
                        theme.set('sidebar-menu', val ? 'hover' : 'default', true, shouldSave());
                    }
                }
            }, {
                id: 'layout-reset-default', name: 'Reset to defaults', type: 'button', options: {
                    click: function(){
                        theme.reset(shouldSave());
                        window.location.reload();
                    }
                }
            } ]
        })


    });
}.call());
