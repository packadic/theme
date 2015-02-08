define([ 'jquery', 'lodash', 'config', 'autoloader', 'theme', 'eventer', 'string' ], function( $, _, config, autoloader, theme, eventer, s ){

    var defined = function( val ){
        return (typeof val !== 'undefined')
    };

    var sidebar = {};
    eventer('sidebar', sidebar);


    sidebar.resolveActiveLink = function(){
        var currentPath = s.trim(location.pathname.toLowerCase(), '/');
        var $el = $(config.selectors.sidebar);
        $el.find('a').each(function(){
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
    sidebar.handleSidebarMenuActiveLink = function( mode, el ){
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
    sidebar.calculateFixedSidebarViewportHeight = function(){
        var sidebarHeight = theme.getViewPort().height - $('section#top').outerHeight();
        if( $('body').hasClass("section-bottom-fixed") ){
            sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
        }

        return sidebarHeight;
    };

    sidebar.handleSidebar = function(){
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

    sidebar.handleFixedSidebar = function(){
        var menu = $('.sidebar-nav-menu');

        //destroySlimScroll(menu);


        if( $('.sidebar-nav-fixed').length === 0 ){
            sidebar.handleSidebarAndContent();
            return;
        }

        if( theme.getViewPort().width >= theme.getBreakpoint('md') ){
            menu.attr("data-height", sidebar.calculateFixedSidebarViewportHeight());
            //initSlimScroll(menu);
            sidebar.handleSidebarAndContent();
        }
    };

    sidebar.handleSidebarAndContent = function(){
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
                height = sidebar.calculateFixedSidebarViewportHeight();
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
    sidebar.handleSidebarToggler = function(){
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
    sidebar.handleFixedSidebarHoverEffect = function(){
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

    sidebar.generateFromTemplate = function( menuItems, templateName, callback ){
        sidebar._trigger('sidebar:generate');
        if( _.isFunction(templateName) ){
            callback = templateName;
        }

        if( !_.isString(templateName) ){
            templateName = 'sidebar';
        }
        theme.getTemplate(templateName, function( template ){
            var html = template({items: menuItems});
            $('ul.sidebar-nav-menu').html('').html(html);
            sidebar._trigger('sidebar:generated');
            if( _.isFunction(callback) ){
                callback();
            }
        });
    };

    sidebar.init = function( sidebarItems ){
        sidebar._defineEvent('sidebar:init');
        sidebar._defineEvent('sidebar:generate');
        sidebar._defineEvent('sidebar:generated');
        var init = function(){
            sidebar._trigger('sidebar:init');
            sidebar.handleFixedSidebar();
            sidebar.handleSidebar();
            sidebar.handleSidebarToggler();
            $(window).on('resize', function(){
                sidebar.handleFixedSidebar();
            });
            sidebar.resolveActiveLink();
        };
        if( defined(sidebarItems) ){
            sidebar.generateFromTemplate(sidebarItems, init);
        } else {
            init();
        }
    };
    return sidebar;

});
