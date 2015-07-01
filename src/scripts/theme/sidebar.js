define(['jquery', 'theme', 'string', 'plugins/async', 'fn/defined'],
    function ($, theme, s, async, defined) {

        // @todo sidebar-toggle
        // @todo sidebar sub-menu hover title right (.sub-menu-title)
        // @todo sidebar-collapsed sub-menu :hover
        // @todo sidebar sub menu @media xs/sm views

        var $sidebarNavMenu = $('ul.sidebar-nav-menu');
        var $sidebarNav = $sidebarNavMenu.parent();
        var $body = $('body');


        var oldMargin = $('main').css('margin');


        /**
         * Sidebar functions
         * @exports theme/sidebar
         */
        var sidebar = {
            options: {
                hidden           : true,
                items            : null,
                openCloseDuration: 600,
                openedWidth      : $body.hasClass("sidebar-nav-closed") ? 235 : parseInt($sidebarNav.css('width')),
                closedWidth      : 45,
                autoScroll       : $sidebarNavMenu.data("auto-scroll"),
                slideSpeed       : parseInt($sidebarNavMenu.data("slide-speed")),
                keepExpand       : $sidebarNavMenu.data("keep-expanded"),
                scroller         : {
                    allowPageScroll: false, // allow page scroll when the element scroll is ended
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



        (sidebar.showLoader = function () {
            Application.emit('sidebar:loader:show');
            $sidebarNavMenu.hide();
            $sidebarNav.find('.loader.loader-light').show();
        }).call();

        sidebar.hideLoader = function () {
            Application.emit('sidebar:loader:hide');
            $sidebarNav.find('.loader.loader-light').hide();
            $sidebarNavMenu.show();
        };

        var calculateFixedHeight = function () {
            var sidebarHeight = Application.getViewPort().height - $('section#top').outerHeight();
            if ( $('body').hasClass("section-bottom-fixed") ) {
                sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
            }

            return sidebarHeight;
        };

        sidebar.resolveActiveLink = function () {
            var currentPath = s.trim(location.pathname.toLowerCase(), '/');
            var md = Application.getBreakpoint('md');
            if ( Application.getViewPort().width < md ) {
                return; // not gonna do this for small devices
            }
            $sidebarNavMenu.find('a').each(function () {
                var href = this.getAttribute('href');
                if ( ! _.isString(href) ) {
                    return;
                }
                href = s.trim(href).replace(location.origin, '');
                var path = s.trim(href, '/');
                if ( path == currentPath ) {
                    console.log('found result', this);
                    var $el = $(this);
                    $el.parent('li').not('.active').addClass('active');
                    var $parentsLi = $el.parents('li').addClass('open');
                    $parentsLi.find('.arrow').addClass('open');
                    $parentsLi.has('ul').children('ul').show();
                }
            })
        };

        sidebar.onSubmenuHover = function ($li) {
            //var $submenuTitle = $li;
            var $title = $(this)
            $li.on('mouseenter', function () {
                $title.prependTo($li);
            });
            $li.on('mouseleave', function () {
                $title.remove();
            });
        };

        sidebar.generateFromTemplate = function (menuItems, templateName, callback) {
            Application.emit('sidebar:sidebar:generate');
            if ( _.isFunction(templateName) ) {
                callback = templateName;
            }

            if ( ! _.isString(templateName) ) {
                templateName = 'sidebar';
            }

            // logDebug('getting template', templateName, menuItems);
            theme.getTemplate(templateName, function (template) {
                //  logDebug('got template');
                var html = template({items: menuItems});
                $('ul.sidebar-nav-menu').html('').html(html);
                Application.emit('sidebar:sidebar:generated');
                if ( _.isFunction(callback) ) {
                    callback();
                }
            });
        };

        /**
         * Checks if the sidebar is fixed
         * @returns {boolean}
         */
        sidebar.isFixed = function () {
            return $body.hasClass('sidebar-nav-fixed')
        };

        /**
         * Checks if the sidebar is closed
         * @returns {boolean}
         */
        sidebar.isClosed = function () {
            return $body.hasClass('sidebar-nav-closed')
        };

        sidebar.openCloseInProgress = false;

        /**
         * Closes/retracts the sidebar (does not hide it)
         * @param callback
         */
        sidebar.close = function (callback) {
            var $main = $('main');

            if ( sidebar.openCloseInProgress || sidebar.isClosed() ) {
                return;
            }

            $body.addClass('sidebar-nav-closing');
            sidebar.openCloseInProgress = true;
            var $title = $sidebarNavMenu.find('li a span.title, li a span.arrow');

            // close all sub-menus
            $sidebarNavMenu.find('ul.sub-menu').each(function () {
                $ul = $(this);
                if ( $ul.is(":visible") ) {
                    $('.arrow', $ul).removeClass("open");
                    $ul.parent().removeClass("open");
                    $ul.slideUp(sidebar.options.slideSpeed);
                }
            });

            async.parallel([
                function (cb) {
                    $main.animate({
                        'margin-left': sidebar.options.closedWidth
                    }, sidebar.options.openCloseDuration, function () {
                        console.log('closed $main');
                        cb();
                    })
                },
                function (cb) {
                    $sidebarNav.animate({
                        width: sidebar.options.closedWidth
                    }, sidebar.options.openCloseDuration, function () {
                        console.log('closed $sidbenav');
                        cb();
                    })
                },
                function (cb) {
                    var closed = 0;
                    $title.animate({
                        opacity: 0
                    }, sidebar.options.openCloseDuration / 3, function () {
                        closed ++;
                        if ( closed == $title.length ) {
                            $title.css('display', 'none');
                            cb();
                        }
                    })
                }
            ], function (err, results) {

                $main.removeAttr('style');
                $sidebarNav.removeAttr('style');
                $title.removeAttr('style');

                $body
                    .addClass("sidebar-nav-closed")
                    .removeClass('sidebar-nav-closing');
                $sidebarNavMenu.addClass("sidebar-nav-menu-closed");

                if ( sidebar.isFixed() ) {
                    $sidebarNavMenu.trigger("mouseleave");
                }

                if ( $.cookie ) {
                    $.cookie('sidebar_closed', '1');
                }
                sidebar.openCloseInProgress = false;

                if ( _.isFunction(callback) ) {
                    callback();
                }
            })
        };

        /**
         * Expand/opens the sidebar (if it was closed/retracted)
         * @param callback
         */
        sidebar.open = function (callback) {
            var $main = $('main');
            if ( sidebar.openCloseInProgress || ! sidebar.isClosed() ) {
                return;
            }
            sidebar.openCloseInProgress = true;

            var $title = $sidebarNavMenu.find('li a span.title, li a span.arrow');

            $body.removeClass("sidebar-nav-closed");
            $sidebarNavMenu.removeClass("sidebar-nav-menu-closed");

            async.parallel([
                function (cb) {
                    $main.css('margin-left', sidebar.options.closedWidth)
                        .animate({
                            'margin-left': sidebar.options.openedWidth
                        }, sidebar.options.openCloseDuration, function () {
                            cb();
                        })
                },
                function (cb) {
                    $sidebarNav.css('width', sidebar.options.closedWidth)
                        .animate({
                            width: sidebar.options.openedWidth
                        }, sidebar.options.openCloseDuration, function () {
                            cb();
                        })
                },
                function (cb) {
                    var opened = 0;

                    $title.css({
                        opacity: 0,
                        display: 'none'
                    });
                    setTimeout(function () {

                        $title.css('display', 'initial');
                        $title.animate({
                            opacity: 1
                        }, sidebar.options.openCloseDuration / 2, function () {
                            opened ++;
                            if ( opened == $title.length ) {
                                $title.css('display', 'none');
                                cb();
                            }
                        })
                    }, sidebar.options.openCloseDuration / 2)
                }
            ], function (err, results) {

                $main.removeAttr('style');
                $sidebarNav.removeAttr('style');
                $title.removeAttr('style');

                if ( $.cookie ) {
                    $.cookie('sidebar_closed', '0');
                }

                sidebar.openCloseInProgress = false;
                if ( _.isFunction(callback) ) {
                    callback();
                }
            })
        };

        /**
         * Hides the sidebar
         */
        sidebar.hide = function () {

            if ( sidebar.hidden ) {
                return;
            }
            sidebar.hidden = true;
            if ( ! $body.hasClass('sidebar-nav-closed') ) {
                $body.addClass('sidebar-nav-closed');
            }
            if ( ! $body.hasClass('sidebar-nav-hide') ) {
                $body.addClass('sidebar-nav-hide');
            }
            $('header.top .sidebar-toggler').hide();
            //oldMargin = $('main').css('margin-left');
            //$('main').css('margin-left', '0px');
        };

        /**
         * Shows the sidebar(if it were hidden)
         */
        sidebar.show = function () {
            sidebar.hidden = false;
            $body.removeClass('sidebar-nav-closed')
                .removeClass('sidebar-nav-hide');
            $('header.top .sidebar-toggler').show();
            //$('main').css('margin-left', oldMargin);
        };



        sidebar.handleToggler = function () {
            if ( $.cookie && $.cookie('sidebar_closed') === '1' && Application.getViewPort().width >= Application.getBreakpoint('md') ) {
                $body.addClass('sidebar-nav-closed');
                $sidebarNavMenu.addClass('sidebar-nav-menu-closed');
            }

            // handle sidebar show/hide
            $body.on('click', '.sidebar-toggler', function (e) {
                $(".sidebar-search", sidebar).removeClass("open");

                var resize = function () {
                    $(window).trigger('resize')
                };
                if ( sidebar.openCloseInProgress ) {
                    return;
                }
                if ( sidebar.isClosed() ) {
                    sidebar.open(resize);
                } else {
                    sidebar.close(resize);
                }


            });
        };

        sidebar.handle = function () {

            var breakpointMd = Application.getBreakpoint('md');

            $sidebarNavMenu.find('li > .sub-menu').filter(function (i) {
                result = $(this).css('caption-side') == 'bottom' || $(this).children('ul').first().hasClass('sub-menu-hover');
                return result;
            }).parent().on('mouseenter', function (e) {
                $(this).children('a').first().clone().addClass('sub-menu-title').prependTo(this);
            }).on('mouseleave', function (e) {
                $(this).find('.sub-menu-title').remove();
            });


            //$sidebar.find('li.open').has('ul.sub-menu').
            $sidebarNavMenu.on('click', 'li > a', function (e) {
                var hasSubMenu = $(this).next().hasClass('sub-menu');

                if ( Application.getViewPort().width >= breakpointMd && $(this).parents('.sidebar-nav-menu-hover-submenu').length === 1 ) { // exit of hover sidebar menu
                    return;
                }

                if ( hasSubMenu === false ) {
                    if ( Application.getViewPort().width < breakpointMd && $('.sidebar-nav').hasClass("in") ) { // close the menu on mobile view while laoding a page
                        $('section#top .responsive-toggler').click();
                    }
                    return;
                }

                if ( $(this).next().hasClass('sub-menu always-open') ) {
                    return;
                }

                var parent = $(this).parent().parent();
                var the = $(this);
                var sub = $(this).next();

                if ( sidebar.options.keepExpand !== true ) {
                    parent.children('li.open').children('a').children('.arrow').removeClass('open');
                    parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(sidebar.options.slideSpeed);
                    parent.children('li.open').removeClass('open');
                }

                var slideOffeset = - 200;

                if ( sub.is(":visible") ) {
                    $('.arrow', $(this)).removeClass("open");
                    $(this).parent().removeClass("open");
                    sub.slideUp(sidebar.options.slideSpeed);
                } else if ( hasSubMenu ) {
                    $('.arrow', $(this)).addClass("open");
                    $(this).parent().addClass("open");
                    sub.slideDown(sidebar.options.slideSpeed);
                }

                e.preventDefault();
            });
        };

        sidebar.handleFixed = function () {

            theme.destroySlimScroll($sidebarNavMenu);

            var width = Application.getViewPort().width;
            var breakpointMd = Application.getBreakpoint('md');

            if ( width < breakpointMd && ! $sidebarNav.hasClass('collapse') ) {
                $sidebarNav.addClass('collapse');
            }

            if ( ! sidebar.isFixed() ) {
                sidebar.handleWithContent();
                return;
            }

            if ( width >= breakpointMd ) {
                $sidebarNavMenu.attr("data-height", calculateFixedHeight());
                theme.initSlimScroll($sidebarNavMenu, sidebar.options.scroller);
                sidebar.handleWithContent();
            }
        };

        sidebar.handleWithContent = function () {
            var breakpointMd = Application.getBreakpoint('md');
            var content = $('main');


            var height;

            if ( $body.hasClass("section-bottom-fixed") === true && sidebar.isFixed() === false ) {
                var available_height = Application.getViewPort().height - $('section#bottom').outerHeight() - $('section#top').outerHeight();
                if ( content.height() < available_height ) {
                    content.attr('style', 'min-height:' + available_height + 'px');
                }
            } else {
                if ( sidebar.isFixed() ) {
                    height = calculateFixedHeight();
                    if ( $body.hasClass('section-bottom-fixed') === false ) {
                        height = height - $('section#bottom').outerHeight();
                    }
                } else {
                    var headerHeight = $('section#top').outerHeight();
                    var footerHeight = $('section#bottom').outerHeight();

                    if ( Application.getViewPort().width < breakpointMd ) {
                        height = Application.getViewPort().height - headerHeight - footerHeight;
                    } else {
                        height = $sidebarNavMenu.height() + 20;
                    }

                    if ( (height + headerHeight + footerHeight) <= Application.getViewPort().height ) {
                        height = Application.getViewPort().height - headerHeight - footerHeight;
                    }
                }
                content.attr('style', 'min-height:' + height + 'px');
            }
        };

        sidebar.handleFixedHover = function () {

            if ( sidebar.isFixed() ) {
                $('.sidebar-nav').on('mouseenter', function () {
                    if ( $body.hasClass('sidebar-nav-closed') ) {
                        $(this).find('.sidebar-nav-menu').removeClass('sidebar-nav-menu-closed');
                    }
                }).on('mouseleave', function () {
                    if ( sidebar.isClosed() ) {
                        $(this).find('.sidebar-nav-menu').addClass('sidebar-nav-menu-closed');
                    }
                });
            }
        };


        var init = function () {
            /**
             * @event App#sidebar:init
             * @type {object}
             */
            Application.emit('sidebar:init', sidebar);
            sidebar.handleFixed();
            sidebar.handle();
            sidebar.handleToggler();
            Application.on('theme:resize', function () {
                if ( sidebar.hidden ) {
                    return;
                }
                sidebar.handleFixed();
            });
            sidebar.resolveActiveLink();
            sidebar.hideLoader();
            if ( sidebar.options.hidden ) {
                sidebar.hide();
            }
            /**
             * @event App#sidebar:ready
             * @type {object}
             */
            Application.emit('sidebar:ready', sidebar);
        };

        /**
         * Initializes the sidebar
         * @param {Object} opts Options
         */
        sidebar.init = function (opts) {
            if ( ! defined(opts) ) {
                opts = {};
            }
            $.extend(sidebar.options, opts);
            console.log('sidebar opts', opts);
            if ( _.isObject(sidebar.options.items) ) {
                sidebar.generateFromTemplate(sidebar.options.items, init);
            } else {
                init();
            }
        };


        return sidebar;

    });
