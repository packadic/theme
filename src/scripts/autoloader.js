define([ 'jquery', 'lodash' ],
    function( $, _ ){
        'use strict';
        var autoloader = {
            initialised: false
        };

        autoloader.detect = function(selector, module, callback){
            var $els = $(selector);
            var load = [];
            if($els.length > 0){
                if(typeof module === 'string'){
                    load.push(module);
                } else {
                    // array
                    load = module;
                }
                console.log('autoloader', 'loading', selector, 'module', module);
                require(load, function(){
                    console.info('autoloader', 'loaded', selector);
                    var args = _.toArray(arguments);
                    callback.apply(callback, args);
                });
            }
        };

        autoloader.init = function(){
            if(autoloader.initialised === true){
                return;
            }

            autoloader.initialised = true;

            autoloader.detect('.selectpicker', 'bs-select', function(){
                $('.selectpicker').selectpicker();
            });

            autoloader.detect('.scrollable', 'mscrollbar', function(){
                $.mCustomScrollbar.defaults.theme = 'dark';
                $('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
            });
        };

        return autoloader;
    });
