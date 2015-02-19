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
        autoloader._defineEvent('ready');

        autoloader.detected = 0;
        autoloader.loaded = 0;

        autoloader.ready = function(callback){
            autoloader.once('ready', callback);
        };

        autoloader.load = function(module, callback){
            var load = [];
            if(typeof module === 'string'){
                load.push(module);
            } else {
                // array
                load = module;
            }
            autoloader.detected++;
            autoloader._trigger('detected');
            autoloader._trigger('detected:' + module);
            require(load, function(){
                autoloader.loaded++;
                autoloader._trigger('loaded');
                autoloader._trigger('loaded:' + module);
                if(autoloader.loaded == autoloader.detected){
                    autoloader._trigger('ready');
                }
                if( _.isFunction(callback)){
                    var args = _.toArray(arguments);
                    callback.apply(callback, args);
                }
            });
        };
        autoloader.detect = function(selector, module, callback){
            autoloader._defineEvent('detected:' + module);
            autoloader._defineEvent('loaded:' + module);
            var $els = $(selector);
            if($els.length > 0){
                autoloader.load(module, callback)
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
