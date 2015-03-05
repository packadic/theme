define([ 'jquery', 'config', 'eventer', 'autoloader',  'plugins/cookie' ],
    function( $, config, eventer, autoloader ){
        'use strict';

        function defined( obj ){
            return !_.isUndefined(obj);
        }

        function cre(){
            return $(document.createElement('div'));
        }

        var theme = {
            options: {}
        };

        eventer('theme', theme);

        // hack to make slideUp and slideDown work with animate, so it uses GSAP
        if( typeof TweenLite !== 'undefined' || typeof TweenMax !== 'undefined' ){
            var slideAnimation = function( type, speed, cb ){
                if( typeof cb !== 'function' ){
                    cb = function(){
                    };
                }
                var margin = function( what ){
                    parseInt(sub.css('margin-' + what).replace('px', ''))
                };
                var attrs = {
                    height: type
                };
                for( var i = 0; i < 4; i += 2 ){
                    var which = [ "Top", "Right", "Bottom", "Left" ][ i ];
                    attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
                }
                attrs.easing = "easeOutStrong";
                return this.animate(attrs, speed).animate({overflow: 'visible'}, {duration: 0, complete: cb});
            };
            $.fn.slideUp = function( speed, cb ){
                slideAnimation.apply(this, [ 'hide', speed, cb ]);
            };
            $.fn.slideDown = function( speed, cb ){
                slideAnimation.apply(this, [ 'show', speed, cb ]);
            };
        }
        // endhack

        (function Options(){

            theme.setOption = function( option, value ){

            };

            theme.getOption = function( option ){

            };

            theme.setOptions = function( options ){
                theme.options = _.merge(theme.options, options);
                // console.log('theme.setOptions options=', options, 'theme.options=', theme.options);
            };

            theme.isDebug = function(){
                return theme.options.debug;
            }

        }.call());

        (function Helpers(){

            /**
             * checks is a property is supported on the browser
             * @param propertyName
             * @returns {boolean}
             * @example
             * var supported = theme.isSupported('animation')
             */
            theme.isSupported = function( propertyName ){
                var elm = document.createElement('div');
                propertyName = propertyName.toLowerCase();

                if( elm.style[ propertyName ] != undefined ){
                    return true;
                }

                var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1),
                    domPrefixes         = 'Webkit Moz ms O'.split(' ');

                for( var i = 0; i < domPrefixes.length; i++ ){
                    if( elm.style[ domPrefixes[ i ] + propertyNameCapital ] != undefined ){
                        return true;
                    }
                }

                return false;
            };

            theme.createLoader = function( name ){
                return cre().addClass('loader').addClass('loader-' + name)
            };

            theme.getTemplate = function( name, cb ){
                //   logDebug('getting template', name, cb);
                require([ 'templates/' + name ], function( template ){
                    //      logDebug('gott template', name, template);
                    cb(template);
                });
            };

            theme.getViewPort = function(){
                var e = window,
                    a = 'inner';
                if( !('innerWidth' in window) ){
                    a = 'client';
                    e = document.documentElement || document.body;
                }

                return {
                    width : e[ a + 'Width' ],
                    height: e[ a + 'Height' ]
                };
            };

            theme.isTouchDevice = function(){
                try {
                    document.createEvent("TouchEvent");
                    return true;
                } catch(e) {
                    return false;
                }
            };

            theme.getRandomId = function( length ){
                if( !_.isNumber(length) ){
                    length = 15;
                }
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i = 0; i < length; i++ ){
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            };

            theme.getBreakpoint = function( which ){
                return parseInt(config.scss.breakpoints[ 'screen-' + which + '-min' ].replace('px', ''));
            };


        }.call());

        (function Events(){


            theme._initResizeEvent = function(){
                theme._defineEvent('resize');
                var resize;
                theme.$window.on('resize', function(){
                    if( resize ){
                        clearTimeout(resize);
                    }
                    resize = setTimeout(function(){
                        theme._trigger('resize');
                    }, 50);
                });
            };

            theme.initEvents = function(){
                theme._initResizeEvent();
            }
        }.call());

        (function Loaders(){

            theme.toastr = function( callback ){
                var args = _.toArray(arguments);
                theme._events.trigger('toastr', args);
                require([ 'toastr' ], callback);
            };

            theme.CodeMirror = function( options, callback ){
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

            theme.showCode = function( options ){
                options.title = options.title || 'Viewing code';
                options.load = options.load || {};
                options.editor = options.editor || {};

                theme.CodeMirror(options.load, function( CodeMirror ){
                    require([ 'bootbox' ], function( bootbox ){

                        var id = theme.getRandomId();
                        var $container = $(document.createElement('div'));
                        var $textarea = $(document.createElement('textarea'));
                        $textarea.attr('id', id).html(options.code);
                        $container.append($textarea);
                        bootbox.dialog({
                            title    : options.title,
                            className: 'bootbox-full-width',
                            message  : $container.html(),
                            buttons  : {
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

        }.call());

        (function Initialisers(){

            // @todo move to demo
            theme.initShowHtml = function(){
                $('.show-html')
                    .on('click', function( e ){
                        e.preventDefault();
                        var $el = $(this);
                        var code = $el[ 0 ].outerHTML;
                        theme.showCode({
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
            };
        }.call());


        theme.init = function( options ){
            options = _.isUndefined(options) ? {} : options;
            // console.log('theme.init', options);
            theme.setOptions(options);
            theme.$window = $(window);
            theme.$document = $(window.document);
            console.log('theme', theme);
            theme.initEvents();

            console.log(theme);

            // @todo move to demo
            theme.initShowHtml();


            autoloader.detect('.sidebar-nav-menu', 'theme/sidebar', function( sidebar ){
                if( defined(theme.options.sidebarItems) ){
                    sidebar.init(theme.options.sidebarItems);
                }
            });

            autoloader.detect('#page-svg-logo', 'theme/logo', function( logo ){
                logo.init();
            })

        };

        return theme;
    });
