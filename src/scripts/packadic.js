/*global window, navigator, document, importScripts, setTimeout, opera */

define([ 'jquery', 'lodash', 'packadic/autoloader', 'bootstrap', 'packadic/side-nav' ],
    function( $, _, autoloader ){
        'use strict';


        function defined( obj ){
            return typeof obj !== 'undefined';
        }

        /**
         *
         * @param options
         * @constructor
         * @property {$} $el - used for event handlers within Packadic
         * @property {$} $sideNav - the side menu
         */
        var Packadic = window.Packadic = function( options ){

            this.options = _.merge({
                data     : {},
                debug    : true,
                selectors: {
                    site   : '#site-wrapper',
                    top    : '#top-wrapper',
                    page   : '#page-wrapper',
                    side   : '#sidebar-wrapper',
                    content: '#content-wrapper',

                    topnav : 'nav.navbar-topmenu',
                    sideNav: '.side-nav ul',
                    topmenu: '#topmenu'

                },
                sideNav  : {},
                topMenu  : {},
                site     : {} // site data
            }, options);

            this.init();
        };

        // Statics
        Packadic.init = function( options ){
            return window.packadic = new Packadic(options);
        };

        Packadic.getTemplate = function( name, data ){
            return window.tpls[ name ](data);
        };

        Packadic.getRandomId = function( length ){
            var text = ""
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i = 0; i < 15; i++ ){
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };

        Packadic.toastr = function( callback ){
            var args = _.toArray(arguments);
            console.log(args);
            require([ 'toastr' ], callback);
        };

        Packadic.CodeMirror = function( options, callback ){
            var load = [ 'codemirror/lib/codemirror', 'codemirror/mode/javascript/javascript', 'codemirror/mode/css/css', 'codemirror/mode/xml/xml', 'codemirror/mode/htmlmixed/htmlmixed' ];

            if( defined(options) ){
                if( defined(options.modes) ){
                    $.each(options.modes, function( i, mode ){
                        mode = 'codemirror/mode/' + mode + '/' + mode;
                        if( load.indexOf(mode) === -1 ){
                            load.push(mode);
                        }
                    });
                }

                if( defined(options.addons) ){
                    $.each(options.addons, function( i, addon ){
                        addon = 'codemirror/addon/' + addon;
                        if( load.indexOf(addon) === -1 ){
                            load.push(addon);
                        }
                    });
                }
            } else {
                callback = options;
            }
            require(load, function( CodeMirror ){
                callback(CodeMirror);
            });
        };

        Packadic.showCode = function( options ){
            options.title = options.title || 'Viewing code';
            options.load = options.load || {};
            options.editor = options.editor || {};

            Packadic.CodeMirror(options.load, function( CodeMirror ){
                require([ 'bootbox' ], function( bootbox ){

                    var id = Packadic.getRandomId();
                    var $container = $(document.createElement('div'));
                    var $textarea = $(document.createElement('textarea'));
                    $textarea.attr('id', id).html(options.code);
                    $container.append($textarea);
                    bootbox.dialog({
                        title    : options.title,
                        className: 'bootbox-full-width',
                        message  : $container.html(),
                        buttons: {
                            success: {
                                label    : 'Close',
                                className: 'btn-primary'
                            }
                        }
                    });

                    // create the codmirror in bootbox
                    var editor = CodeMirror.fromTextArea(document.getElementById(id), _.merge({
                        mode        : 'htmlmixed',
                        lineNumbers : true,
                        lineWrapping: true,
                        theme       : 'zenburn'
                    }, options.editor));

                    // adjust the size
                    editor.setSize('100%', 200);
                    CodeMirror.commands.selectAll(editor);
                    CodeMirror.commands.indentAuto(editor);
                    CodeMirror.commands.goDocStart(editor);
                    editor.refresh();
                    setTimeout(function(){
                        editor.refresh();
                    }, 400);
                });
            });
        };

        Packadic.prototype = {

            // Handlers
            handleResize : function(){

            },

            // Data
            getNavigation: function( which ){
                return this.site.data.navigation[ which ];
            },


            // Events
            _trigger     : function( type, data ){
                this.$el.trigger(_.merge({type: type}, data));
            },

            _on        : function( type, cb ){
                this.$el.on(type, cb);
            },


            // Initialisers
            initSideNav: function(){
                this.$sideNav.sideNav(this.options.sideNav);
                this.$sideNav.sideNav('createFromJSON', this.getNavigation('sidenav'));
            },

            initDebug: function(){
                if( this.options.debug === true ){
                    $('.site-debug').show();
                    $('*[data-debug]').each(function(){
                        var $this = $(this);
                        debug[ $this.data('debug') ]($this);
                    });
                } else {
                    $('.site-debug').hide();
                }
            },


            initShowHtml: function(){
                $('.show-html')
                    .on('click', function( e ){
                        e.preventDefault();
                        var $el = $(this);
                        var code = $el[ 0 ].outerHTML;
                        Packadic.showCode({
                            title : 'Showing code',
                            code  : code,
                            editor: {
                                mode: 'htmlmixed'
                            }
                        });
                    })
                    .tooltip({
                        title: 'Click to view HTML code'
                    });
            },


            init: function(){
                var self = this;
                this.$element = $(document.createElement('div'));
                this.$window = $(window);
                this.$document = $(window.document);
                $.each(this.options.selectors, function( name, selector ){
                    this[ '$' + name ] = $(selector);
                }.bind(this));
                this.$sideNav = this.$sideNav.first();

                this.site = this.options.site;


                autoloader.init();

                this.initShowHtml();
                this.initSideNav();
                this.initDebug();


                console.log(this);
            }
        };

        return Packadic;
    });
