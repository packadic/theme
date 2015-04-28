define([ 'jquery', 'config', 'theme', 'eventer', 'string', 'plugins/async' ],
    function( $, config, theme, eventer, s, async ){

        // @todo sidebar-toggle
        // @todo sidebar sub-menu hover title right (.sub-menu-title)
        // @todo sidebar-collapsed sub-menu :hover
        // @todo sidebar sub menu @media xs/sm views

        var defined = function( val ){
            return (typeof val !== 'undefined')
        };


        var $sidebarNavMenu = $('ul.sidebar-nav-menu');
        var $sidebarNav = $sidebarNavMenu.parent();
        var $body = $('body');

        var options = {};
        var oldMargin = $('main').css('margin');
        var sidebar = {
            defaults: {
                hidden           : true,
                items            : null,
                openCloseDuration: 600,
                openedWidth      : $body.hasClass("sidebar-nav-closed") ? 235 : parseInt($sidebarNav.css('width')),
                closedWidth      : 45,
                autoScroll       : $sidebarNavMenu.data("auto-scroll"),
                slideSpeed       : parseInt($sidebarNavMenu.data("slide-speed")),
                keepExpand       : $sidebarNavMenu.data("keep-expanded"),
                scroller         : {
                    allowPageScroll: true, // allow page scroll when the element scroll is ended
                    size           : '7px',
                    color          : ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
                    wrapperClass   : ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                    railColor      : ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#eaeaea'),
                    position       : 'right',
                    alwaysVisible  : ($(this).attr("data-always-visible") == "1" ? true : false),
                    railVisible    : ($(this).attr("data-rail-visible") == "1" ? true : false),
                    disableFadeOut : true
                }
            }
        };


        eventer('sidebar', sidebar);
        sidebar._defineEvent('init');
        sidebar._defineEvent('generate');
        sidebar._defineEvent('generated');
        sidebar._defineEvent('loader:show');
        sidebar._defineEvent('loader:hide');


        (sidebar.showLoader = function(){
            sidebar._trigger('loader:show');
            $sidebarNavMenu.hide();
            $sidebarNav.find('.loader.loader-light').show();
        }).call();

        sidebar.hideLoader = function(){
            sidebar._trigger('loader:hide');
            $sidebarNav.find('.loader.loader-light').hide();
            $sidebarNavMenu.show();
        };

        var calculateFixedHeight = function(){
            var sidebarHeight = theme.getViewPort().height - $('section#top').outerHeight();
            if( $('body').hasClass("section-bottom-fixed") ){
                sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
            }

            return sidebarHeight;
        };

        (function Helpers(){

            sidebar.resolveActiveLink = function(){
                var currentPath = s.trim(location.pathname.toLowerCase(), '/');

                $sidebarNavMenu.find('a').each(function(){
                    var href = this.getAttribute('href');
                    if( !_.isString(href) ){
                        return;
                    }
                    href = s.trim(href).replace(location.origin, '');
                    var path = s.trim(href, '/');
                    if( path == currentPath ){
                        console.log('found result', this);
                        var $el = $(this);
                        $el.parent('li').not('.active').addClass('active');
                        var $parentsLi = $el.parents('li').addClass('open');
                        $parentsLi.find('.arrow').addClass('open');
                        $parentsLi.has('ul').children('ul').show();
                    }
                })
            };

            sidebar.onSubmenuHover = function( $li ){
                //var $submenuTitle = $li;
                var $title = $(this)
                $li.on('mouseenter', function(){
                    $title.prependTo($li);
                });
                $li.on('mouseleave', function(){
                    $title.remove();
                });
            };

            sidebar.generateFromTemplate = function( menuItems, templateName, callback ){
                sidebar._trigger('sidebar:generate');
                if( _.isFunction(templateName) ){
                    callback = templateName;
                }

                if( !_.isString(templateName) ){
                    templateName = 'sidebar';
                }

                // logDebug('getting template', templateName, menuItems);
                theme.getTemplate(templateName, function( template ){
                    //  logDebug('got template');
                    var html = template({items: menuItems});
                    $('ul.sidebar-nav-menu').html('').html(html);
                    sidebar._trigger('sidebar:generated');
                    if( _.isFunction(callback) ){
                        callback();
                    }
                });
            };

            sidebar.isFixed = function(){
                return $body.hasClass('sidebar-nav-fixed')
            };


            sidebar.isClosed = function(){
                return $body.hasClass('sidebar-nav-closed')
            };

        }.call());

        (function Toggler(){
            sidebar.openCloseInProgress = false;

            sidebar.close = function( callback ){
                var $main = $('main');

                if( sidebar.openCloseInProgress || sidebar.isClosed() ){
                    return;
                }

                sidebar.openCloseInProgress = true;
                var $title = $sidebarNavMenu.find('li a span.title, li a span.arrow');

                // close all sub-menus
                $sidebarNavMenu.find('ul.sub-menu').each(function(){
                    $ul = $(this);
                    if( $ul.is(":visible") ){
                        $('.arrow', $ul).removeClass("open");
                        $ul.parent().removeClass("open");
                        $ul.slideUp(options.slideSpeed);
                    }
                });

                async.parallel([
                    function( cb ){
                        $main.animate({
                            'margin-left': options.closedWidth
                        }, options.openCloseDuration, function(){
                            console.log('closed $main');
                            cb();
                        })
                    },
                    function( cb ){
                        $sidebarNav.animate({
                            width: options.closedWidth
                        }, options.openCloseDuration, function(){
                            console.log('closed $sidbenav');
                            cb();
                        })
                    },
                    function( cb ){
                        var closed = 0;
                        $title.animate({
                            opacity: 0
                        }, options.openCloseDuration / 3, function(){
                            closed++;
                            if( closed == $title.length ){
                                $title.css('display', 'none');
                                cb();
                            }
                        })
                    }
                ], function( err, results ){

                    $main.removeAttr('style');
                    $sidebarNav.removeAttr('style');
                    $title.removeAttr('style');

                    $body.addClass("sidebar-nav-closed");
                    $sidebarNavMenu.addClass("sidebar-nav-menu-closed");

                    if( sidebar.isFixed() ){
                        $sidebarNavMenu.trigger("mouseleave");
                    }

                    if( $.cookie ){
                        $.cookie('sidebar_closed', '1');
                    }
                    sidebar.openCloseInProgress = false;

                    if( _.isFunction(callback) ){
                        callback();
                    }
                })
            };

            sidebar.open = function( callback ){
                var $main = $('main');
                if( sidebar.openCloseInProgress || !sidebar.isClosed() ){
                    return;
                }
                sidebar.openCloseInProgress = true;

                var $title = $sidebarNavMenu.find('li a span.title, li a span.arrow');

                $body.removeClass("sidebar-nav-closed");
                $sidebarNavMenu.removeClass("sidebar-nav-menu-closed");

                async.parallel([
                    function( cb ){
                        $main.css('margin-left', options.closedWidth)
                            .animate({
                                'margin-left': options.openedWidth
                            }, options.openCloseDuration, function(){
                                cb();
                            })
                    },
                    function( cb ){
                        $sidebarNav.css('width', options.closedWidth)
                            .animate({
                                width: options.openedWidth
                            }, options.openCloseDuration, function(){
                                cb();
                            })
                    },
                    function( cb ){
                        var opened = 0;

                        $title.css({
                            opacity: 0,
                            display: 'none'
                        });
                        setTimeout(function(){

                            $title.css('display', 'initial');
                            $title.animate({
                                opacity: 1
                            }, options.openCloseDuration / 2, function(){
                                opened++;
                                if( opened == $title.length ){
                                    $title.css('display', 'none');
                                    cb();
                                }
                            })
                        }, options.openCloseDuration / 2)
                    }
                ], function( err, results ){

                    $main.removeAttr('style');
                    $sidebarNav.removeAttr('style');
                    $title.removeAttr('style');

                    if( $.cookie ){
                        $.cookie('sidebar_closed', '0');
                    }

                    sidebar.openCloseInProgress = false;
                    if( _.isFunction(callback) ){
                        callback();
                    }
                })
            };

            sidebar.hide = function(){
                if( sidebar.hidden ){
                    return;
                }
                sidebar.hidden = true;
                $sidebarNav.hide();
                $sidebarNavMenu.hide();
                $('header.top .sidebar-toggler').hide();
                oldMargin = $('main').css('margin-left');
                $('main').css('margin-left', '0px');
            };

            sidebar.show = function(){
                sidebar.hidden = false;
                $sidebarNav.show();
                $sidebarNavMenu.show();
                $('header.top .sidebar-toggler').show();
                $('main').css('margin-left', oldMargin);
            };

            sidebar.handleToggler = function(){
                if( $.cookie && $.cookie('sidebar_closed') === '1' && theme.getViewPort().width >= theme.getBreakpoint('md') ){
                    $body.addClass('sidebar-nav-closed');
                    $sidebarNavMenu.addClass('sidebar-nav-menu-closed');
                }

                // handle sidebar show/hide
                $body.on('click', '.sidebar-toggler', function( e ){
                    $(".sidebar-search", sidebar).removeClass("open");

                    var resize = function(){
                        $(window).trigger('resize')
                    };
                    if( sidebar.openCloseInProgress ){
                        return;
                    }
                    if( sidebar.isClosed() ){
                        sidebar.open(resize);
                    } else {
                        sidebar.close(resize);
                    }


                });
            };


        }.call());

        (function Handlers(){

            sidebar.handle = function(){

                var breakpointMd = theme.getBreakpoint('md');

                $sidebarNavMenu.find('li > .sub-menu').filter(function( i ){

                    result = $(this).css('caption-side') == 'bottom' || $(this).children('ul').first().hasClass('sub-menu-hover');
                    return result;
                }).parent().on('mouseenter', function( e ){
                    $(this).children('a').first().clone().addClass('sub-menu-title').prependTo(this);
                }).on('mouseleave', function( e ){
                    $(this).find('.sub-menu-title').remove();
                });


                //$sidebar.find('li.open').has('ul.sub-menu').
                $sidebarNavMenu.on('click', 'li > a', function( e ){
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
                    var sub = $(this).next();

                    if( options.keepExpand !== true ){
                        parent.children('li.open').children('a').children('.arrow').removeClass('open');
                        parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(options.slideSpeed);
                        parent.children('li.open').removeClass('open');
                    }

                    var slideOffeset = -200;

                    if( sub.is(":visible") ){
                        $('.arrow', $(this)).removeClass("open");
                        $(this).parent().removeClass("open");
                        sub.slideUp(options.slideSpeed);
                    } else if( hasSubMenu ){
                        $('.arrow', $(this)).addClass("open");
                        $(this).parent().addClass("open");
                        sub.slideDown(options.slideSpeed);
                    }

                    e.preventDefault();
                });
            };

            sidebar.handleFixed = function(){

                theme.destroySlimScroll($sidebarNavMenu);

                if( !sidebar.isFixed() ){
                    sidebar.handleWithContent();
                    return;
                }

                if( theme.getViewPort().width >= theme.getBreakpoint('md') ){
                    $sidebarNavMenu.attr("data-height", calculateFixedHeight());
                    theme.initSlimScroll($sidebarNavMenu, options.scroller);
                    sidebar.handleWithContent();
                }
            };

            sidebar.handleWithContent = function(){
                var breakpointMd = theme.getBreakpoint('md');
                var content = $('main');


                var height;

                if( $body.hasClass("page-footer-fixed") === true && sidebar.isFixed() === false ){
                    var available_height = theme.getViewPort().height - $('section#bottom').outerHeight() - $('section#top').outerHeight();
                    if( content.height() < available_height ){
                        content.attr('style', 'min-height:' + available_height + 'px');
                    }
                } else {
                    if( sidebar.isFixed() ){
                        height = calculateFixedHeight();
                        if( $body.hasClass('section-bottom-fixed') === false ){
                            height = height - $('section#bottom').outerHeight();
                        }
                    } else {
                        var headerHeight = $('section#top').outerHeight();
                        var footerHeight = $('section#bottom').outerHeight();

                        if( theme.getViewPort().width < breakpointMd ){
                            height = theme.getViewPort().height - headerHeight - footerHeight;
                        } else {
                            height = $sidebarNavMenu.height() + 20;
                        }

                        if( (height + headerHeight + footerHeight) <= theme.getViewPort().height ){
                            height = theme.getViewPort().height - headerHeight - footerHeight;
                        }
                    }
                    content.attr('style', 'min-height:' + height + 'px');
                }
            };

            sidebar.handleFixedHover = function(){

                if( sidebar.isFixed() ){
                    $('.sidebar-nav').on('mouseenter', function(){
                        if( $body.hasClass('sidebar-nav-closed') ){
                            $(this).find('.sidebar-nav-menu').removeClass('sidebar-nav-menu-closed');
                        }
                    }).on('mouseleave', function(){
                        if( sidebar.isClosed() ){
                            $(this).find('.sidebar-nav-menu').addClass('sidebar-nav-menu-closed');
                        }
                    });
                }
            };

        }.call());

        sidebar.init = function( opts ){
            if( !defined(opts) ){
                opts = {};
            }
            options = $.extend({}, sidebar.defaults, opts);
            console.log('sidebar opts', options, opts);
            var init = function(){
                sidebar._trigger('init');
                sidebar.handleFixed();
                sidebar.handle();
                sidebar.handleToggler();
                theme.on('resize', function(){
                    if( sidebar.hidden ){
                        return;
                    }
                    sidebar.handleFixed();
                });
                sidebar.resolveActiveLink();
                sidebar.hideLoader();
                if( options.hidden ){
                    sidebar.hide();
                }
            };
            if( _.isObject(options.items) ){
                sidebar.generateFromTemplate(options.items, init);
            } else {
                init();
            }
        };


        return sidebar;

    });
