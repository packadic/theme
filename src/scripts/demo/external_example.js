(function () {

    App.config.merge({
        debug   : true,
        demo    : true,
        oauth_io: 'UpFevf23G2O93iSlMOQ5PRL4zq0'
    });
    App.on('state:*', function(){
        console.log('state event', arguments);
    });
    App.on('theme:*', function(){
        console.log('theme event', arguments);
    });
    App.on('sidebar:*', function(){
        console.log('sidebar event', arguments);
    });
    App.on('state:preboot', function () {
        console.warn('(' + App.getElapsedTime() + 's) PRE-BOOT');
    }).on('state:booting', function () {
        console.warn('(' + App.getElapsedTime() + 's) BOOTING');
    }).on('state:starting', function () {
        console.warn('(' + App.getElapsedTime() + 's) STARTING');
        require(['jquery', 'theme', 'theme/sidebar', 'autoload', 'jq/box'], function ($, theme, sidebar, autoload) {
            console.warn('(' + App.getElapsedTime() + 's) BOOTED');


            sidebar.init({hidden: false, items: packadic.site.data.navigation.sidebar});

            $(function () {
                autoload.scan($('body'), function () {
                    if ( App.config.get('pageLoadedOnAutoloaded') === true ) {
                        App.removePageLoader();
                    }
                });
            });
        });
    }).on('state:prestart', function () {
        console.warn('(' + App.getElapsedTime() + 's) PRESTART');
    }).on('state:started', function () {
        console.warn('(' + App.getElapsedTime() + 's) STARTED');
    });

    App.on('state:starting', function () {
        require(['jquery', 'jq/box'], function ($, theme, cre) {
            $(function () {
                var tb = $('.test-box');
                tb.box();
            });
        });
    });

    App.on('state:starting', function () {
        require(['jquery', 'theme/settings-editor', 'theme', 'storage', 'fn/cre'], function ($, SettingsEditor, theme, storage, cre) {



            var shouldSave = function () {
                return storage.get('demo.layout.editor.save', {default: false}) == "true";
            };

            var layoutEditor = window.ceditors = new SettingsEditor($('#layout-editor'), {
                target  : '#layout-editor',
                controls: [{
                    id: 'persistent-save', name: 'Save adjustments', 'default': false, type: 'switch', options: {
                        isEnabled: shouldSave,
                        toggle   : function (event, val) {
                            storage.set('demo.layout.editor.save', val);
                        }
                    }
                }, {
                    id: 'top', name: 'Top', 'default': theme.get('section-top'), type: 'select', options: {
                        choices : {
                            'hidden': {name: 'Hidden'},
                            'normal': {name: 'Normal'},
                            fixed   : {name: 'Fixed'}
                        },
                        onChange: function ($el) {
                            theme.set('section-top', $el.val(), true, shouldSave())
                        }
                    }
                }, {
                    id: 'page-boxed', name: 'Boxed Layout', 'default': false, type: 'switch', options: {
                        isEnabled: function () {
                            return theme.get('layout-option') === 'boxed'
                        },
                        toggle   : function (event, val) {
                            theme.set('layout-option', val ? 'boxed' : 'fluid', true, shouldSave());
                        }
                    }
                }, {
                    id: 'footer-fixed', name: 'Fixed Bottom', 'default': true, type: 'switch', options: {
                        isEnabled: function () {
                            return theme.get('section-bottom') === 'fixed'
                        },
                        toggle   : function (event, val) {
                            theme.set('section-bottom', val ? 'fixed' : 'default', true, shouldSave());
                        }
                    }
                }, {
                    id: 'sidebar-fixed', name: 'Fixed Sidebar', 'default': false, type: 'switch', options: {
                        isEnabled: function () {
                            return theme.get('sidebar-option') === 'fixed'
                        },
                        toggle   : function (event, val) {
                            theme.set('sidebar-option', val ? 'fixed' : 'default', true, shouldSave());
                        }
                    }
                }, {
                    id: 'sidebar-style', name: 'Light Sidebar', 'default': false, type: 'switch', options: {
                        isEnabled: function () {
                            return theme.get('sidebar-option') === 'light'
                        },
                        toggle   : function (event, val) {
                            theme.set('sidebar-style', val ? 'light' : 'default', true, shouldSave());
                        }
                    }

                }, {
                    id: 'sidebar-menu', name: 'Sidebar Hover', 'default': false, type: 'switch', options: {
                        isEnabled: function () {
                            return theme.get('sidebar-menu') === 'hover'
                        },
                        toggle   : function (event, val) {
                            theme.set('sidebar-menu', val ? 'hover' : 'default', true, shouldSave());
                        }
                    }
                }, {
                    id: 'layout-reset-default', name: 'Reset to defaults', type: 'button', options: {
                        click: function () {
                            theme.reset(shouldSave());
                            window.location.reload();
                        }
                    }
                }]
            })


            var texturePicker = function () {
                var $el = $('#texture-picker');
                setInterval(function () {
                    return;
                    var element = $(':hover');
                    if ( element.length ) {
                        var domElement = element[element.length - 1];
                        var tagName = domElement.tagName;
                        var id = domElement.id ? ' id="' + domElement.id + '"' : "";

                        document.getElementById('test').innerHTML =
                            "hover: &lt;" + tagName.toLowerCase() + id + "&gt;";
                    }
                }, 100);
            }.call();
        });
    });
}.call());

