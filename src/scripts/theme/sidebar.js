define([ 'jquery', 'lodash', 'config', 'autoloader', 'theme', 'eventer', 'string' ], function( $, _, config, autoloader, theme, eventer, s ){

    var defined = function( val ){
        return (typeof val !== 'undefined')
    };

    var sidebar = {};
    eventer('sidebar', sidebar);
    sidebar._defineEvent('init');
    sidebar._defineEvent('generate');
    sidebar._defineEvent('generated');
    sidebar._defineEvent('loader:show');
    sidebar._defineEvent('loader:hide');

    var $sidebar = $(config.selectors.sidebar);
    var $sidebarNav = $sidebar.parent();

    sidebar.showLoader = function(){
        sidebar._trigger('loader:show');
        $sidebar.hide();
        $sidebarNav.find('.loader.loader-light').show();
    };
    sidebar.showLoader();
    sidebar.hideLoader = function(){
        sidebar._trigger('loader:hide');
        $sidebarNav.find('.loader.loader-light').hide();
        $sidebar.show();
    };

    var calculateFixedHeight = function(){
        var sidebarHeight = theme.getViewPort().height - $('section#top').outerHeight();
        if( $('body').hasClass("section-bottom-fixed") ){
            sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
        }

        return sidebarHeight;
    };


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

    sidebar.handle = function(){
        var breakpointMd = theme.getBreakpoint('md');

        $sidebar.on('click', 'li > a', function( e ){
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

    sidebar.handleFixed = function(){
        var menu = $('.sidebar-nav-menu');

        //destroySlimScroll(menu);


        if( $('.sidebar-nav-fixed').length === 0 ){
            sidebar.handleWithContent();
            return;
        }

        if( theme.getViewPort().width >= theme.getBreakpoint('md') ){
            menu.attr("data-height", calculateFixedHeight());
            //initSlimScroll(menu);
            sidebar.handleWithContent();
        }
    };

    sidebar.handleWithContent = function(){
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
                height = calculateFixedHeight();
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
    sidebar.handleToggler = function(){
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
    sidebar.handleFixedHover = function(){
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
        var init = function(){
            sidebar._trigger('init');
            sidebar.handleFixed();
            sidebar.handle();
            sidebar.handleToggler();
            theme.on('resize', function(){
                sidebar.handleFixed();
            });
            sidebar.resolveActiveLink();
            sidebar.hideLoader();
        };
        if( defined(sidebarItems) ){
            sidebar.generateFromTemplate(sidebarItems, init);
        } else {
            init();
        }
    };
    return sidebar;

});
