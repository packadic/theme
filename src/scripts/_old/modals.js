/*global window, navigator, document, importScripts, setTimeout, opera */

define([ 'jquery', 'lodash', 'bootstrap' ],
    function( $, _ ){
        'use strict';

        function defined( val ){
            return !_.isUndefined(val);
        }



        function getTemplate( data ){
            return window.tpls[ 'modal' ](data);
        }

        function generateRandomId( length ){
            if( !defined(length) ){
                length = 15;
            }
            var text = '';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for( var i = 0; i < length; i++ ){
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }

        /**
         *
         * @param {object} options - Configuration options
         * @property options.appendTo
         * @constructor
         */
        function Modal( options ){
            this.options = _.merge(Modal.defaults.options, options);
        }

        Modal.defaults = {
            options: {
                id: null,
                appendTo: 'body',
                closeOnEsc: true,
                closeOnClick: false,
                header: null,
                title: null,
                closeButton: true,
                content: null,
                footer: null,
                buttons: {}
            },
            data: {

            }
        };

        Modal.prototype = {
            _listeners: {},
            options: {},
            $modal: null,
            _trigger  : function(){
                var args = _.toArray(arguments);
                var event = args.splice(0, 1);
                var self = this;
                if( _.isArray(this._listeners[ event ]) ){
                    _.forEach(this._listeners[ event ], function( listener ){
                        listener.apply(self, args);
                    });
                }
            },
            _getTemplateData: function(){
                var o = this.options;
                var data = _.merge(Modal.defaults.data, {
                    displayTitle: o.displayTitle
                });
            },
            show      : function(){
                this._trigger('show');
                this.$modal.show();
            },
            hide      : function(){
                this._trigger('hide');
                this.$modal.remove();
            },
            on        : function( event, callback ){
                if( !defined(this._listeners[ event ]) ){
                    this._listeners[ event ] = [];
                }
                this._listeners[ event ].push(callback);
            },
            config    : function( key, val ){
                if( !defined(key) ){
                    return this.options;
                }
                if( !defined(val) ){
                    return this.options[ key ];
                }
                if( defined(key) && defined(val) ){
                    this.options[ key ] = val;
                }
            },
            refresh   : function(){
                this._trigger('refresh');
                if(defined(this.$modal)){
                    this.$modal.remove();
                }
                var html = getTemplate(this._data);
                this.$modal = $(html);
                $(this.options.appendTo).append(this.$modal);
                this._trigger('refreshed');
            }
        };

        var modals = {};

        modals.Modal = Modal;
        modals.create = function( options ){
            if( !defined(window.packadicModals) ){
                window.packadicModals = {};
            }
            if( !defined(options) ){
                options = {};
            }
            if( !defined(options.id) ){
                options.id = generateRandomId();
            }

            window.packadicModals[ options.id ] = new modals.Modal(options);

            return window.packadicModals[ options.id ];
        };

        modals.alert = function(options, callback){
            var config = {
                content: '<p>'
            };
            if( _.isString(options) ){
                config.content = '<p>' + options + '</p>';
            } else if( _.isObject(options)){
                config = _.merge(config, options);
            }

            var modal = modals.create(config);

            modal.on('close', function(){
                callback.apply(this);
            })
        };
        modals.prompt = function(options, callback){};
        modals.confirm = function(options, callback){};

        modals.form = function(options){};


        return modals;
    });
