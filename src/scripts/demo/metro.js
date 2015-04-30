define(['jquery', 'theme', 'theme/sidebar'], function ($, theme, sidebar) {

    // Handle Theme Settings
    var handleTheme = function () {

        window.theme = {};
        var opts = window.theme.opts = {
            'layout-option'                        : 'fluid',
            'sidebar-option'                       : 'default',
            'page-header-option'                   : 'fixed',
            'page-header-top-dropdown-style-option': 'light',
            'sidebar-menu-option'                  : 'accordion',
            'page-footer-option'                   : 'fixed',
            'sidebar-pos-option'                   : 'left',
            'sidebar-style-option'                 : 'default'
        };


        var panel = $('.theme-panel');

        if ($('body').hasClass('page-boxed') === false) {
            opts['layout-option'] = 'fluid';
        }

        //handle theme layout
        var resetLayout = function () {
            $("body").
                removeClass("page-boxed").
                removeClass("section-bottom-fixed").
                removeClass("sidebar-nav-fixed").
                removeClass("section-top-fixed").
                removeClass("sidebar-nav-reversed");

            $('section#top > header.top').removeClass("container");

            if ($('section#page').parent(".container").size() === 1) {
                $('section#page').insertAfter('body > .clearfix');
            }

            if ($('section#bottom > .container').size() === 1) {
                $('section#bottom').html($('section#bottom > .container').html());
            } else if ($('section#bottom').parent(".container").size() === 1) {
                $('section#bottom').insertAfter('section#page');
                //$('.scroll-to-top').insertAfter('section#bottom');
            }

            $(".top-menu > .navbar-nav > li.dropdown").removeClass("dropdown-dark");

            $('body > .container').remove();
        };

        var lastSelectedLayout = '';

        var setLayout = function () {

            var opts = window.theme.opts;
            var a = {
                'layout-option'                        : 'fluid',
                'sidebar-option'                       : 'default',
                'page-header-option'                   : 'fixed',
                'page-header-top-dropdown-style-option': 'light',
                'sidebar-menu-option'                  : 'accordion',
                'page-footer-option'                   : 'fixed',
                'sidebar-pos-option'                   : 'left',
                'sidebar-style-option'                 : 'default'
            };
            var layoutOption = opts['layout-option'];
            var sidebarOption = opts['sidebar-option'];
            var headerOption = opts['page-header-option'];
            var footerOption = opts['page-footer-option'];
            var sidebarPosOption = opts['sidebar-pos-option'];
            var sidebarStyleOption = opts['sidebar-style-option'];
            var sidebarMenuOption = opts['sidebar-menu-option'];
            var headerTopDropdownStyle = opts['page-header-top-dropdown-style-option'];

            if (sidebarOption == "fixed" && headerOption == "default") {
                alert('Default Header with Fixed Sidebar option is not supported. Proceed with Fixed Header with Fixed Sidebar.');
                opts['page-header-option'] = "fixed";
                opts['sidebar-option'] = "fixed";
                sidebarOption = 'fixed';
                headerOption = 'fixed';
            }

            resetLayout(); // reset layout to default state

            if (layoutOption === "boxed") {
                $("body").addClass("page-boxed");

                // set header
                $('section#top > header.top').addClass("container");
                var cont = $('body > .clearfix').after('<div class="container"></div>');

                // set content
                $('section#page').appendTo('body > .container');

                // set footer
                if (footerOption === 'fixed') {
                    $('section#bottom').html('<div class="container">' + $('section#bottom').html() + '</div>');
                } else {
                    $('section#bottom').appendTo('body > .container');
                }
            }

            if (lastSelectedLayout != layoutOption) {
                //layout changed, run responsive handler:
                theme._trigger('resize');
            }
            lastSelectedLayout = layoutOption;

            //header
            if (headerOption === 'fixed') {
                $("body").addClass("section-top-fixed");
                $("section#top").removeClass("navbar-static-top").addClass("navbar-fixed-top");
            } else {
                $("body").removeClass("section-top-fixed");
                $("section#top").removeClass("navbar-fixed-top").addClass("navbar-static-top");
            }

            //sidebar
            if ($('body').hasClass('page-full-width') === false) {
                if (sidebarOption === 'fixed') {
                    $("body").addClass("sidebar-nav-fixed");
                    $("sidebar-nav-menu").addClass("sidebar-nav-menu-fixed");
                    $("sidebar-nav-menu").removeClass("sidebar-nav-menu-default");
                    sidebar.handleFixedHover();
                    //Layout.initFixedSidebarHoverEffect();
                } else {
                    $("body").removeClass("sidebar-nav-fixed");
                    $("sidebar-nav-menu").addClass("sidebar-nav-menu-default");
                    $("sidebar-nav-menu").removeClass("sidebar-nav-menu-fixed");
                    $('.sidebar-nav-menu').unbind('mouseenter').unbind('mouseleave');
                }
            }

            // top dropdown style
            if (headerTopDropdownStyle === 'dark') {
                $(".top-menu > .navbar-nav > li.dropdown").addClass("dropdown-dark");
            } else {
                $(".top-menu > .navbar-nav > li.dropdown").removeClass("dropdown-dark");
            }

            //footer
            if (footerOption === 'fixed') {
                $("body").addClass("section-bottom-fixed");
            } else {
                $("body").removeClass("section-bottom-fixed");
            }

            //sidebar style
            if (sidebarStyleOption === 'light') {
                $(".sidebar-nav-menu").addClass("sidebar-nav-menu-light");
            } else {
                $(".sidebar-nav-menu").removeClass("sidebar-nav-menu-light");
            }

            //sidebar menu
            if (sidebarMenuOption === 'hover') {
                if (sidebarOption == 'fixed') {
                    opts['sidebar-menu-option'] = "accordion";
                    alert("Hover Sidebar Menu is not compatible with Fixed Sidebar Mode. Select Default Sidebar Mode Instead.");
                } else {
                    $(".sidebar-nav-menu").addClass("sidebar-nav-menu-hover-submenu");
                }
            } else {
                $(".sidebar-nav-menu").removeClass("sidebar-nav-menu-hover-submenu");
            }

            if (sidebarPosOption === 'right') {
                $("body").addClass("sidebar-nav-reversed");
                $('#frontend-link').tooltip('destroy').tooltip({
                    placement: 'left'
                });
            } else {
                $("body").removeClass("sidebar-nav-reversed");
                $('#frontend-link').tooltip('destroy').tooltip({
                    placement: 'right'
                });
            }


            sidebar.handleWithContent(); // fix content height
            sidebar.handleFixed(); // reinitialize fixed sidebar
        };

        // handle theme colors
        var setColor = function (color) {
            var color_ = (Metronic.isRTL() ? color + '-rtl' : color);
            $('#style_color').attr("href", Layout.getLayoutCssPath() + 'themes/' + color_ + ".css");
            if (color == 'light2') {
                $('.page-logo img').attr('src', Layout.getLayoutImgPath() + 'logo-invert.png');
            } else {
                $('.page-logo img').attr('src', Layout.getLayoutImgPath() + 'logo.png');
            }
        };

        var dunno = function () {
            $('.toggler', panel).click(function () {
                $('.toggler').hide();
                $('.toggler-close').show();
                $('.theme-panel > .theme-options').show();
            });

            $('.toggler-close', panel).click(function () {
                $('.toggler').show();
                $('.toggler-close').hide();
                $('.theme-panel > .theme-options').hide();
            });

            $('.theme-colors > ul > li', panel).click(function () {
                var color = $(this).attr("data-style");
                setColor(color);
                $('ul > li', panel).removeClass("current");
                $(this).addClass("current");
            });

            // set default theme options:

            if ($("body").hasClass("page-boxed")) {
                opts['layout-option'] = "boxed";
            }

            if ($("body").hasClass("sidebar-nav-fixed")) {
                opts['sidebar-option'] = "fixed";
            }

            if ($("body").hasClass("section-top-fixed")) {
                opts['page-header-option'] = "fixed";
            }

            if ($("body").hasClass("section-bottom-fixed")) {
                opts['page-footer-option'] = "fixed";
            }

            if ($("body").hasClass("sidebar-nav-reversed")) {
                opts['sidebar-pos-option'] = "right";
            }

            if ($(".sidebar-nav-menu").hasClass("sidebar-nav-menu-light")) {
                opts['sidebar-style-option'] = "light";
            }

            if ($(".sidebar-nav-menu").hasClass("sidebar-nav-menu-hover-submenu")) {
                opts['sidebar-menu-option'] = "hover";
            }

            var sidebarOption = opts['sidebar-option'];
            var headerOption = opts['page-header-option'];
            var footerOption = opts['page-footer-option'];
            var sidebarPosOption = opts['sidebar-pos-option'];
            var sidebarStyleOption = opts['sidebar-style-option'];
            var sidebarMenuOption = opts['sidebar-menu-option'];

        };

        return {
            reset: resetLayout,
            apply: setLayout,
            color: setColor
        }
    };

    $(document).ready(function () {
        var func = handleTheme();
        window.theme.reset = func.reset;
        window.theme.apply = func.apply;
        window.theme.color = func.color;
    });



});
