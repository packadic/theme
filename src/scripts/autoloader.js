define([ 'jquery', 'lodash', 'config', 'eventer' ],
    function( $, _ , config, eventer){
        'use strict';
        var autoloader = {
            initialised: false
        };
        eventer('autoloader', autoloader);

        autoloader._defineEvent('init');
        autoloader._defineEvent('detected');
        autoloader._defineEvent('loaded');

        autoloader.detect = function(selector, module, callback){
            autoloader._defineEvent('detected:' + module);
            autoloader._defineEvent('loaded:' + module);
            var $els = $(selector);
            var load = [];
            if($els.length > 0){
                if(typeof module === 'string'){
                    load.push(module);
                } else {
                    // array
                    load = module;
                }
                autoloader._trigger('detected');
                autoloader._trigger('detected:' + module);
                require(load, function(){
                    autoloader._trigger('loaded');
                    autoloader._trigger('loaded:' + module);
                    if( _.isFunction(callback)){
                        var args = _.toArray(arguments);
                        callback.apply(callback, args);
                    }
                });
            }
        };

        autoloader.init = function(){
            autoloader._trigger('init');
            if(autoloader.initialised === true){
                return;
            }
            autoloader.initialised = true;

            autoloader.detect('.selectpicker', 'plugins/bs-select', function(){
                $('.selectpicker').selectpicker();
            });

            autoloader.detect('.scrollable', 'plugins/mscrollbar', function(){
                $.mCustomScrollbar.defaults.theme = 'dark';
                $('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
            });
        };

        return autoloader;
    });
