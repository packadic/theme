define([ 'jquery', 'config', 'eventer' ],
    function( $, config, eventer){
        'use strict';
        var al = {
            initialised: false
        };
        eventer('autoloader', al);

        al._defineEvent('init');
        al._defineEvent('detected');
        al._defineEvent('loaded');
        al._defineEvent('ready');

        al.detected = 0;
        al.loaded = 0;

        al.ready = function(callback){
            al.once('ready', callback);
        };

        al.load = function(module, callback){
            var load = [];
            if(typeof module === 'string'){
                load.push(module);
            } else {
                // array
                load = module;
            }
            al.detected++;
            al._trigger('detected');
            al._trigger('detected:' + module);
            require(load, function(){
                al.loaded++;
                al._trigger('loaded');
                al._trigger('loaded:' + module);
                if(al.loaded == al.detected){
                    al._trigger('ready');
                }
                if( _.isFunction(callback)){
                    var args = _.toArray(arguments);
                    callback.apply(callback, args);
                }
            });
        };
        al.detect = function(selector, module, callback){
            al._defineEvent('detected:' + module);
            al._defineEvent('loaded:' + module);
            var $els = $(selector);
            if($els.length > 0){
                al.load(module, callback)
            }
        };

        al.init = function(){
            al._trigger('init');
            if(al.initialised === true){
                return;
            }
            al.initialised = true;

            al.detect('body', 'plugins/bootstrap', function(){

            });

            al.detect('.selectpicker', 'plugins/bs-select', function(){
                $('.selectpicker').selectpicker();
            });

            al.detect('.scrollable', 'plugins/mscrollbar', function(){
                $.mCustomScrollbar.defaults.theme = 'dark';
                $('.scrollable').addClass('mCustomScrollbar').mCustomScrollbar();
            });

            al.detect('[data-share-buttons]', 'share-buttons', function(sb){
                sb.applyTo('[data-share-buttons]');
            });

            al.detect('.highlighter', 'highlighter', function(highlighter){
                highlighter.applyTo($('.highlighter'));
            });

            al.detect('.tipped', 'plugins/bootstrap', function(){
                $('.tipped').tooltip();
            });
            al.detect('[data-toggle="tooltip"]', 'plugins/bootstrap', function(){
                $('[data-toggle="tooltip"]').tooltip({
                    container: 'body'
                });
            });
            al.detect('[data-toggle="popover"]', 'plugins/bootstrap', function(){
                var $el = $('[data-toggle="popover"]');
                $(document).on('click', '[data-toggle="popover"]', function(e){
                    e.preventDefault();
                });
                $el.popover();
            });
            al.detect('[data-toggle="confirmation"]', 'plugins/bs-confirmation', function(){
                $('a[data-toggle="confirmation"]').confirmation({
                    container: 'body',
                    btnCancelIcon: 'fa fa-remove',
                    btnOkIcon: 'fa fa-check',
                    btnOkClass: 'btn-xs btn-info',
                    btnCancelClass: 'btn-xs btn-primary'

                });
            });

            al.detect('.modal, [data-toggle="modal"]', 'plugins/bs-modal', function(){
                //$("select.select2").select2();
            });

            al.detect('select.select2', 'plugins/select2', function(){
                $("select.select2").select2();
            });

            al.detect('input.switch', 'plugins/bs-switch', function(){
                $("input.switch").bootstrapSwitch();
            });
        };

        return al;
    });
