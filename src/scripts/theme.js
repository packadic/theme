define([ 'jquery', 'fn/defined', 'fn/default', 'fn/cre', 'config', 'eventer', 'autoload', 'Q',
         'plugins/cookie', 'plugins/bs-material-ripples' ],
    function( $, defined, def, cre, config, eventer, autoload, Q ){
        'use strict';

        var theme = {
            options: {},
            $hidden: cre().addClass('hide')
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
                    domPrefixes = 'Webkit Moz ms O'.split(' ');

                for( var i = 0; i < domPrefixes.length; i++ ){
                    if( elm.style[ domPrefixes[ i ] + propertyNameCapital ] != undefined ){
                        return true;
                    }
                }

                return false;
            };

            theme.createLoader = function( name ){
                name = name || 'dark';
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

            theme.initSettingsEditor = function(){
                var $el = $('.settings-editor');
                $el.find('> .btn').on('click', function(e){
                    e.preventDefault();
                    $(this).parent().toggleClass('active');
                })
            };

            theme.initHeaderSearchForm = function(){
                $('section#top').on('click', '.search-form', function( e ){
                    $(this).addClass("open");
                    $(this).find('.form-control')
                        .focus()
                        .on('blur', function( e ){
                            $(this).closest('.search-form').removeClass("open");
                            $(this).unbind("blur");
                        });
                }).on('mousedown', '.search-form.open .submit', function( e ){
                    e.preventDefault();
                    e.stopPropagation();
                    $(this).closest('.search-form').submit();
                });
            };

            theme._initResizeEvent = function(){
                theme._defineEvent('resize');
                theme.$window.on('resize', function(){
                    setTimeout(function(){
                        theme._trigger('resize');
                    }, 600); // delay the event a bit, otherwise it doesn't seem to work well in some cases
                });
            };

            theme.initEvents = function(){
                theme._initResizeEvent();
            }
        }.call());

        (function PluginHelpers(){

            theme.initSlimScroll = function( el, opts ){
                require([ 'plugins/jquery-slimscroll' ], function(){
                    $(el).each(function(){
                        if( $(this).attr("data-initialized") ){
                            return; // exit
                        }

                        var height = $(this).attr("data-height") ? $(this).attr("data-height") : $(this).css('height');

                        if( !defined(opts) ){
                            opts = {};
                        }

                        $(this).slimScroll(_.merge({
                            allowPageScroll: true, // allow page scroll when the element scroll is ended
                            size           : '6px',
                            color          : ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
                            wrapperClass   : ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                            railColor      : ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#222'),
                            position       : 'right',
                            height         : height,
                            alwaysVisible  : ($(this).attr("data-always-visible") == "1" ? true : false),
                            railVisible    : ($(this).attr("data-rail-visible") == "1" ? true : false),
                            disableFadeOut : true
                        }, opts));

                        $(this).attr("data-initialized", "1");
                    });
                });
            };

            theme.destroySlimScroll = function( el ){
                $(el).each(function(){
                    if( $(this).attr("data-initialized") === "1" ){ // destroy existing instance before updating the height
                        $(this).removeAttr("data-initialized");
                        $(this).removeAttr("style");

                        var attrList = {};

                        // store the custom attribures so later we will reassign.
                        if( $(this).attr("data-handle-color") ){
                            attrList[ "data-handle-color" ] = $(this).attr("data-handle-color");
                        }
                        if( $(this).attr("data-wrapper-class") ){
                            attrList[ "data-wrapper-class" ] = $(this).attr("data-wrapper-class");
                        }
                        if( $(this).attr("data-rail-color") ){
                            attrList[ "data-rail-color" ] = $(this).attr("data-rail-color");
                        }
                        if( $(this).attr("data-always-visible") ){
                            attrList[ "data-always-visible" ] = $(this).attr("data-always-visible");
                        }
                        if( $(this).attr("data-rail-visible") ){
                            attrList[ "data-rail-visible" ] = $(this).attr("data-rail-visible");
                        }

                        $(this).slimScroll({
                            wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                            destroy     : true
                        });

                        var the = $(this);

                        // reassign custom attributes
                        $.each(attrList, function( key, value ){
                            the.attr(key, value);
                        });

                    }
                });
            };

            theme.scrollable = function( $el ){
                require([ 'plugins/mscrollbar' ], function(){
                    $.mCustomScrollbar.defaults.theme = 'dark';
                    $el.addClass('mCustomScrollbar').mCustomScrollbar();
                });
            };

            theme.toastr = function( fnName, message, title ){
                require([ 'plugins/toastr' ], function( toastr ){
                    toastr[ fnName ].apply(toastr, [ message, title ]);
                });
            };

        }.call());

        (function Interaction(){

            theme.notify = theme.toastr;

            theme.alert = function( opt ){
                var type = opt.type || 'success',
                    message = opt.message || '',
                    delay = opt.delay || 3000,
                    title = opt.title || false,
                    target = opt.target || 'main > div.content',
                    insertFnName = opt.insertFnName || 'prepend';

                var $alert = cre('div');
                var $close = cre('button');

                $alert
                    .addClass('alert alert-' + type + ' alert-dismissible')
                    .append($close
                        .attr('type', 'button')
                        .attr('data-dismiss', 'alert')
                        .attr('aria-label', 'Close')
                        .addClass('close')
                        .html('<span aria-hidden="true">×</span>'));

                if( title !== false ){
                    $alert.append(cre('strong').text(title));
                }

                $alert.append(cre('p').text(message));

                $('main > div.content').first()[ insertFnName ]($alert);
                setTimeout(function(){
                    $alert.hide('slow');
                    $alert.fadeOut('slow');
                }, delay);
            };

            theme.box = function( title, icon, actions ){
                var deferred = Q.defer();
                actions = defined(actions) ? actions : false;
                theme.getTemplate('box', function( template ){
                    var $box = $(template({
                        title  : title,
                        icon   : icon,
                        actions: actions
                    }));
                    $box.$content = $box.find('section').first();
                    $box.$actions = $box.find('> header > .actions').first();
                    $box.createAction = function( id, name, classes, href ){
                        classes = defined(classes) ? classes : 'btn-primary';
                        href = defined(href) ? href : 'javascript:;';
                        $box.$actions[ id ] = cre('a')
                            .attr('href', href)
                            .attr('id', id)
                            .addClass('btn')
                            .addClass(classes)
                            .text(name);
                        $box.$actions.append($box.$actions[ id ]);
                        return $box.$actions[ id ];
                    };
                    deferred.resolve($box);
                });
                return deferred.promise;
            };

            theme.button = function( name, size, classes, type, href ){
                type = def(type, 'a');
                size = def(size, 'xs');
                classes = def(classes, '');
                type = def(type, 'a');
                href = def(href, 'javascript:;');

                var $button = cre(type)
                    .addClass('btn btn-' + size)
                    .addClass(classes);

                if( type === 'a' ){
                    $button.attr('href', href).text(name);
                } else if( type === 'button' ){
                    $button.val(name);
                }
                return $button;
            };


            theme.table = function(cols, rows, classes){
                var deferred = Q.defer();
                theme.getTemplate('table', function( template ){
                    var $table = $(template({
                        table: {
                            classes: classes,
                            cols: def(cols, []),
                            rows: def(rows, [])
                        }
                    }));
                    deferred.resolve($table);
                });
                return deferred.promise;
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
            theme.initHeaderSearchForm();
            theme.initSettingsEditor();

            $([
                ".btn:not(.btn-link)",
                ".card-image",
                ".navbar a:not(.withoutripple)",
                ".dropdown-menu a",
                ".nav-tabs a:not(.withoutripple)",
                ".withripple"
            ].join(",")).addClass('withripple').ripples();



        };

        return theme;
    });
