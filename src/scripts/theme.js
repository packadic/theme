define([ 'jquery', 'plugins/lodash', 'config', 'plugins/events', 'plugins/cookie' ],
    function( $, _, config, EventEmitter ){
        'use strict';

        function defined( obj ){
            return !_.isUndefined(obj);
        }

        var theme = {
            options: {
                debug: true
            }
        };

        // hack to make slideUp and slideDown work with animate, so it uses GSAP
        if(typeof TweenLite !== 'undefined' || typeof TweenMax !== 'undefined'){
            var slideAnimation = function( type, speed, cb ){
                if( typeof cb !== 'function' ) cb = function(){
                };
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

            theme.setOption = function(option, value){

            };

            theme.getOption = function(option){

            };

            theme.setOptions = function(options){
                theme.options = _.merge(theme.options, options);
            };

            theme.isDebug = function(){
                return theme.options.debug;
            }

        }.call());

        (function Helpers(){

            theme.getTemplate = function( name, data ){
                return window.tpls[ name ](data);
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
                return parseInt(theme.scss.breakpoints[ 'screen-' + which + '-min' ].replace('px', ''));
            };

            theme.unquote = function( str, quoteChar ){
                quoteChar = quoteChar || '"';
                if( str[ 0 ] === quoteChar && str[ str.length - 1 ] === quoteChar ){
                    return str.slice(1, str.length - 1);
                } else {
                    return str;
                }
            };

        }.call());

        (function Events(){

            // https://github.com/Wolfy87/EventEmitter/blob/master/docs/guide.md
            theme.on = function(event, fn){
                theme._events.on(event, fn);
            };

            theme.once = function(event, fn){
                theme._events.once(event, fn);
            };

            theme.off = function(event, fn){
                theme._events.off(event, fn);
            };

            theme._defineEvent = function(event){
                theme._events.defineEvent(event);
                if(theme.isDebug()){
                    theme.on(event, function(){
                        console.debug('DEBUG::theme:event', event)
                    })
                }
            };

            theme._initResizeEvent = function(){
                theme._defineEvent('resize');
                var resize;
                theme.$window.resize(function(){
                    if( resize ){
                        clearTimeout(resize);
                    }
                    resize = setTimeout(function(){
                        theme._events.trigger('resize', theme);
                    }, 50);
                });
            };

            theme.initEvents = function(){
                theme._events = new EventEmitter();
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

        (function Sidebar(){
            theme.initSidebar = function(){
                //layout handlers
                theme.handleFixedSidebar();
                theme.handleSidebar();
                theme.handleSidebarToggler();
                theme.on('resize', theme.handleFixedSidebar);
            };
            theme.calculateFixedSidebarViewportHeight = function(){
                var sidebarHeight = theme.getViewPort().height - $('section#top').outerHeight();
                if( $('body').hasClass("section-bottom-fixed") ){
                    sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
                }

                return sidebarHeight;
            };
            theme.handleSidebar = function(){
                var $el = $(config.selectors.sidebar);
                var breakpointMd = theme.getBreakpoint('md');

                $el.on('click', 'li > a', function( e ){
                    var hasSubMenu = $(this).next().hasClass('sub-menu');

                    if( theme.getViewPort().width >= breakpointMd && $(this).parents('.sidebar-nav-menu-hover-submenu').length === 1 ){ // exit of hover sidebar menu
                        return;
                    }

                    if( hasSubMenu === false ){
                        if( theme.getViewPort().width < breakpointMd && $('.sidebar-nav').hasClass("in") ){ // close the menu on mobile view while laoding a page
                            $('section#top .responsive-toggler').click();
                        }
                        return;
                    }

                    if( $(this).next().hasClass('sub-menu always-open') ){
                        return;
                    }

                    var parent = $(this).parent().parent();
                    var the = $(this);
                    var menu = $('.sidebar-nav-menu');
                    var sub = $(this).next();

                    var autoScroll = menu.data("auto-scroll");
                    var slideSpeed = parseInt(menu.data("slide-speed"));
                    var keepExpand = menu.data("keep-expanded");


                    if( keepExpand !== true ){
                        parent.children('li.open').children('a').children('.arrow').removeClass('open');
                        parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
                        parent.children('li.open').removeClass('open');
                    }

                    var slideOffeset = -200;

                    if( sub.is(":visible") ){
                        $('.arrow', $(this)).removeClass("open");
                        $(this).parent().removeClass("open");
                        sub.slideUp(slideSpeed);
                    } else if( hasSubMenu ){
                        $('.arrow', $(this)).addClass("open");
                        $(this).parent().addClass("open");
                        sub.slideDown(slideSpeed);
                    }

                    e.preventDefault();
                });

            };
            theme.handleFixedSidebar = function(){
                var menu = $('.sidebar-nav-menu');

                //destroySlimScroll(menu);

                if( $('.sidebar-nav-fixed').length === 0 ){
                    theme.handleSidebarAndContent();
                    return;
                }

                if( theme.getViewPort().width >= theme.getBreakpoint('md') ){
                    menu.attr("data-height", theme.calculateFixedSidebarViewportHeight());
                    //initSlimScroll(menu);
                    theme.handleSidebarAndContent();
                }
            };
            theme.handleSidebarAndContent = function(){
                var breakpointMd = theme.getBreakpoint('md');
                var content = $('main');
                var sidebar = $('.sidebar-nav');
                var body = $('body');
                var height;

                if( body.hasClass("page-footer-fixed") === true && body.hasClass("sidebar-nav-fixed") === false ){
                    var available_height = theme.getViewPort().height - $('section#bottom').outerHeight() - $('section#top').outerHeight();
                    if( content.height() < available_height ){
                        content.attr('style', 'min-height:' + available_height + 'px');
                    }
                } else {
                    if( body.hasClass('sidebar-nav-fixed') ){
                        height = theme.calculateFixedSidebarViewportHeight();
                        if( body.hasClass('section-bottom-fixed') === false ){
                            height = height - $('section#bottom').outerHeight();
                        }
                    } else {
                        var headerHeight = $('section#top').outerHeight();
                        var footerHeight = $('section#bottom').outerHeight();

                        if( theme.getViewPort().width < breakpointMd ){
                            height = theme.getViewPort().height - headerHeight - footerHeight;
                        } else {
                            height = sidebar.height() + 20;
                        }

                        if( (height + headerHeight + footerHeight) <= theme.getViewPort().height ){
                            height = theme.getViewPort().height - headerHeight - footerHeight;
                        }
                    }
                    content.attr('style', 'min-height:' + height + 'px');
                }
            };
            theme.handleSidebarToggler = function(){
                var body = $('body');
                if( $.cookie && $.cookie('sidebar_closed') === '1' && theme.getViewPort().width >= theme.getBreakpoint('md') ){
                    $('body').addClass('sidebar-nav-closed');
                    $('.sidebar-nav-menu').addClass('sidebar-nav-menu-closed');
                }

                // handle sidebar show/hide
                $('body').on('click', '.sidebar-toggler', function( e ){
                    var sidebar = $('.sidebar-nav');
                    var sidebarMenu = $('.sidebar-nav-menu');
                    $(".sidebar-search", sidebar).removeClass("open");

                    if( body.hasClass("sidebar-nav-closed") ){
                        body.removeClass("sidebar-nav-closed");
                        sidebarMenu.removeClass("sidebar-nav-menu-closed");
                        if( $.cookie ){
                            $.cookie('sidebar_closed', '0');
                        }
                    } else {
                        body.addClass("sidebar-nav-closed");
                        sidebarMenu.addClass("sidebar-nav-menu-closed");
                        if( body.hasClass("sidebar-nav-fixed") ){
                            sidebarMenu.trigger("mouseleave");
                        }
                        if( $.cookie ){
                            $.cookie('sidebar_closed', '1');
                        }
                    }

                    $(window).trigger('resize');
                });
            };
            theme.handleSidebarMenuActiveLink = function( mode, el ){
                var url = location.hash.toLowerCase();

                var menu = $('.sidebar-nav-menu');

                if( mode === 'click' || mode === 'set' ){
                    el = $(el);
                } else if( mode === 'match' ){
                    menu.find("li > a").each(function(){
                        var path = $(this).attr("href").toLowerCase();
                        // url match condition
                        if( path.length > 1 && url.substr(1, path.length - 1) == path.substr(1) ){
                            el = $(this);
                            return;
                        }
                    });
                }

                if( !el || el.size() == 0 ){
                    return;
                }

                if( el.attr('href').toLowerCase() === 'javascript:;' || el.attr('href').toLowerCase() === '#' ){
                    return;
                }

                var slideSpeed = parseInt(menu.data("slide-speed"));
                var keepExpand = menu.data("keep-expanded");

                // disable active states
                menu.find('li.active').removeClass('active');
                menu.find('li > a > .selected').remove();

                if( menu.hasClass('sidebar-nav-menu-hover-submenu') === false ){
                    menu.find('li.open').each(function(){
                        if( $(this).children('.sub-menu').size() === 0 ){
                            $(this).removeClass('open');
                            $(this).find('> a > .arrow.open').removeClass('open');
                        }
                    });
                } else {
                    menu.find('li.open').removeClass('open');
                }

                el.parents('li').each(function(){
                    $(this).addClass('active');
                    $(this).find('> a > span.arrow').addClass('open');

                    if( $(this).parent('ul.sidebar-nav-menu').size() === 1 ){
                        $(this).find('> a').append('<span class="selected"></span>');
                    }

                    if( $(this).children('ul.sub-menu').size() === 1 ){
                        $(this).addClass('open');
                    }
                });

                if( mode === 'click' ){
                    if( theme.getViewPort().width < theme.getBreakpoint('md') && $('.sidebar-nav').hasClass("in") ){ // close the menu on mobile view while laoding a page
                        $('section#top .responsive-toggler').click();
                    }
                }
            };
            theme.handleFixedSidebarHoverEffect = function(){
                var body = $('body');
                if( body.hasClass('sidebar-nav-fixed') ){
                    $('.sidebar-nav').on('mouseenter', function(){
                        if( body.hasClass('sidebar-nav-closed') ){
                            $(this).find('.sidebar-nav-menu').removeClass('sidebar-nav-menu-closed');
                        }
                    }).on('mouseleave', function(){
                        if( body.hasClass('sidebar-nav-closed') ){
                            $(this).find('.sidebar-nav-menu').addClass('sidebar-nav-menu-closed');
                        }
                    });
                }
            };

            theme.sidebar = {};
            theme.sidebar.init = function(){};
            theme.sidebar.bindTogglers = function(){};

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

        theme.init = function(options){
            theme.setOptions(options);
            theme.$window = $(window);
            theme.$document = $(window.document);
            theme.scss = JSON.parse(theme.unquote($('head').css('font-family'), "'"));

            this.initEvents();

            console.log(theme);


            // @todo move to demo
            theme.initShowHtml();
            theme.initSidebar();
        };

        return theme;
    });
