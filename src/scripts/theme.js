define(['jquery', 'fn/defined', 'fn/default', 'fn/cre', 'storage',
        'plugins/cookie', 'plugins/bs-material-ripples'],
    function ($, defined, def, cre, storage) {
        'use strict';


        /**
         * The theme module provides required stuff for the theme
         * @exports theme
         * @fires module:theme~init
         * @fires module:theme~resize
         * @fires module:theme~layout
         * @fires module:theme~save
         * @fires module:theme~reset
         * @property {object} colors                    - Contains all colors, colorName -> hexCode
         * @property {object} fonts                     - Contains the font families
         * @property {object} breakpoints               - Contains the breakpoints
         * @property {ThemeOptions} options                   - Theme options
         */
        var theme = {
            $hidden       : cre().addClass('hide'),
            /**
             * @typedef ThemeOptions
             * @type {object}
             * @property {string} [layout-option=fluid]         - fluid or boxed
             * @property {string} [sidebar-option=default]      - default or fixed
             * @property {string} [sidebar-menu=accordion]      - accordion or hover
             * @property {string} [section-top=normal]          - normal or fixed
             * @property {string} [section-bottom=fixed]        - normal or fixed
             */
            options       : storage.get('theme.options', {
                json   : true,
                default: Application.config('theme')
            }),
            defaultOptions: Application.config('theme'),
            colors        : Application.colors,
            fonts         : Application.fonts,
            breakpoints   : Application.breakpoints
        };


        var $body = $('body'),
            $sidebarNavMenu = $('.sidebar-nav-menu');

        theme._initLayout = function () {
            theme.options = storage.get('theme.options', {
                json   : true,
                default: Application.config('theme')
            });
            theme.applyLayout();
        };

        var resetLayout = function () {
            $("body").
                removeClass("page-boxed").
                removeClass("section-bottom-fixed").
                removeClass("sidebar-nav-fixed").
                removeClass("section-top-fixed").
                removeClass('section-top-hidden').
                removeClass("sidebar-nav-reversed");

            $('section#top > header.top').removeClass("container");

            if ( $('section#page').parent(".container").size() === 1 ) {
                $('section#page').insertAfter('body > .clearfix');
            }

            if ( $('section#bottom > .container').size() === 1 ) {
                $('section#bottom').html($('section#bottom > .container').html());
            } else if ( $('section#bottom').parent(".container").size() === 1 ) {
                $('section#bottom').insertAfter('section#page');
                //$('.scroll-to-top').insertAfter('section#bottom');
            }

            $(".top-menu > .navbar-nav > li.dropdown").removeClass("dropdown-dark");

            $('body > .container').remove();
        };

        var lastSelectedLayout = '';
        theme.applyLayout = function () {
            var opts = theme.options;
            var layoutOption = opts['layout-option'];
            var sidebarOption = opts['sidebar-option'];


            var sidebarPosition = opts['sidebar-pos-option'];
            var sidebarStyle = opts['sidebar-style'];
            var sidebarMenu = opts['sidebar-menu'];


            var sectionBottom = opts['section-bottom'];
            var sectionTop = opts['section-top'];

            if ( sidebarOption == "fixed" ) {
                opts['section-top'] = "fixed";
                opts['sidebar-option'] = "fixed";
                sidebarOption = 'fixed';
                sectionTop = 'fixed';
            }

            resetLayout(); // reset layout to default state

            if ( layoutOption === "boxed" ) {
                $body.addClass("page-boxed");

                // set header
                $('section#top > header.top').addClass("container");
                var cont = $('body > .clearfix').after('<div class="container"></div>');

                // set content
                $('section#page').appendTo('body > .container');

                // set footer
                if ( sectionBottom === 'fixed' ) {
                    $('section#bottom').html('<div class="container">' + $('section#bottom').html() + '</div>');
                } else {
                    $('section#bottom').appendTo('body > .container');
                }
            }

            if ( lastSelectedLayout != layoutOption ) {
                //layout changed, run responsive handler:
                Application.emit('theme:resize');
            }
            lastSelectedLayout = layoutOption;

            //header
            if ( sectionTop === 'fixed' ) {
                $body.addClass("section-top-fixed");
                $("section#top").removeClass("navbar-static-top").addClass("navbar-fixed-top");
            } else if ( sectionTop === 'normal' ) {
                $body.removeClass("section-top-fixed");
                $("section#top").removeClass("navbar-fixed-top").addClass("navbar-static-top");
            } else if ( sectionTop === 'hidden' ) {
                $body.addClass('section-top-hidden');
            }

            //sidebar
            if ( $body.hasClass('page-full-width') === false ) {
                if ( sidebarOption === 'fixed' ) {
                    $body.addClass("sidebar-nav-fixed");
                    $sidebarNavMenu.addClass("sidebar-nav-menu-fixed")
                        .removeClass("sidebar-nav-menu-default");

                    require(['theme/sidebar'], function (sidebar) {
                        sidebar.handleFixedHover();
                    });
                    //Layout.initFixedSidebarHoverEffect();
                } else {
                    $body.removeClass("sidebar-nav-fixed");
                    $sidebarNavMenu.addClass("sidebar-nav-menu-default")
                        .removeClass("sidebar-nav-menu-fixed")
                        .unbind('mouseenter')
                        .unbind('mouseleave');
                }
            }

            //footer
            if ( sectionBottom === 'fixed' ) {
                $body.addClass("section-bottom-fixed");
            } else {
                $body.removeClass("section-bottom-fixed");
            }

            //sidebar style
            if ( sidebarStyle === 'light' ) {
                $sidebarNavMenu.addClass("sidebar-nav-menu-light");
            } else {
                $sidebarNavMenu.removeClass("sidebar-nav-menu-light");
            }

            //sidebar menu
            if ( sidebarMenu === 'hover' ) {
                if ( sidebarOption == 'fixed' ) {
                    opts['sidebar-menu'] = "accordion";
                    alert("Hover Sidebar Menu is not compatible with Fixed Sidebar Mode. Select Default Sidebar Mode Instead.");
                } else {
                    $sidebarNavMenu.addClass("sidebar-nav-menu-hover-submenu");
                }
            } else {
                $sidebarNavMenu.removeClass("sidebar-nav-menu-hover-submenu");
            }

            if ( sidebarPosition === 'right' ) {
                $body.addClass("sidebar-nav-reversed");
                $('#frontend-link').tooltip('destroy').tooltip({
                    placement: 'left'
                });
            } else {
                $body.removeClass("sidebar-nav-reversed");
                $('#frontend-link').tooltip('destroy').tooltip({
                    placement: 'right'
                });
            }

            require(['theme/sidebar'], function (sidebar) {
                sidebar.handleWithContent(); // fix content height
                sidebar.handleFixed(); // reinitialize fixed sidebar
                /**
                 * Fires when the layout has been refreshed, which applies the theme options
                 * @event module:theme~layout
                 * @type {object}
                 */
                Application.emit('theme:layout', theme.options);
            });
        };

        /**
         * Get the value of an option
         * @param {string} opt The option name
         * @returns {*}
         */
        theme.get = function (opt) {
            if ( ! defined(theme.options[opt]) ) {
                console.error('theme.get failed on ', opt);
                return;
            }
            return theme.options[opt];
        };


        /**
         * Set the value of an option
         * @param {string} opt The name of the option
         * @param {*} value The new value
         * @param {boolean} [refresh=true] If true, the theme layout will be refreshed
         * @param {boolean} [save=true] If true, the change will be persistent (uses localStorage)
         */
        theme.set = function (opt, value, refresh, save) {
            if ( ! defined(theme.options[opt]) || ! defined(value) ) return;
            refresh = defined(refresh) ? refresh : true;
            save = defined(save) ? save : true;
            console.log('doing ', opt, ' with:', value, ' refresh:', refresh, 'save', save);
            theme.options[opt] = value;
            if ( save ) theme.save();
            if ( refresh ) theme.applyLayout();
        };

        /**
         * Saves the current theme options making all changes to it persistent
         */
        theme.save = function () {
            storage.set('theme.options', theme.options, {json: true});
            /**
             * Fires when the theme options are saved into the localStorage
             * @event module:theme~save
             * @type {object}
             */
            Application.emit('theme:save', theme.options);
        };

        /**
         * Resets the theme options to default
         * @param {boolean} [save=true] If true, the resetted options will be persistent
         */
        theme.reset = function (save) {
            if ( ! defined(save) || save === true ) {
                storage.del('theme.options');
            }
            theme.options = Application.config('theme');
            theme.applyLayout();
            /**
             * Fires when the theme options have been resetted to default
             * @event module:theme~reset
             * @type {object} The current theme options
             */
            Application.emit('theme:reset', theme.options);
        };



        /**
         * Returns the debug boolean
         * @returns {boolean}
         */
        theme.isDebug = Application.isDebug.bind(Application);

        /**
         * Checks if the sidebar is used
         * @returns {boolean}
         */
        theme.hasSidebar = function () {
            return $('nav.sidebar-nav').length > 0;
        };

        theme.createLoader = function (name) {
            name = name || 'dark';
            return cre().addClass('loader').addClass('loader-' + name)
        };

        theme.getTemplate = Application.getTemplate.bind(Application);
        theme.isSupported = Application.isSupported.bind(Application);
        theme.getViewPort = Application.getViewPort.bind(Application);
        theme.isTouchDevice = Application.isTouchDevice.bind(Application);
        theme.getRandomId = Application.getRandomId.bind(Application);
        theme.getBreakpoint = Application.getBreakpoint.bind(Application);


        theme._initSettingsEditor = function () {
            var $el = $('.settings-editor');
            $el.find('> .btn').on('click', function (e) {
                e.preventDefault();
                $(this).parent().toggleClass('active');
            })
        };

        theme._initHeaderSearchForm = function () {
            $('section#top').on('click', '.search-form', function (e) {
                $(this).addClass("open");
                $(this).find('.form-control')
                    .focus()
                    .on('blur', function (e) {
                        $(this).closest('.search-form').removeClass("open");
                        $(this).unbind("blur");
                    });
            }).on('mousedown', '.search-form.open .submit', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).closest('.search-form').submit();
            });
        };

        theme._initResizeEvent = function () {
            theme.$window.on('resize', function () {
                setTimeout(function () {
                    /**
                     * @event module:theme~resize
                     */
                    Application.emit('theme:resize', theme, 'resize');
                }, 600); // delay the event a bit, otherwise it doesn't seem to work well in some cases
            });
        };

        theme._initEvents = function () {
            theme._initResizeEvent();
        };
        /**
         * Scroll to top button
         * @todo put the duration into the config
         * @private
         */
        theme._initScrollToTop = function(){
            $('#scroll-top').off('click').on('click', function(e){
                e.preventDefault();
                Application.emit('theme:scrolltop');
                Application.scrollTo(document.body, 0, 600);
            })
        };

        /**
         * Ensures there is a scroll top top button
         */
        theme.ensureScrollToTop = function(){
            if($('#scroll-top').length > 0) return;
            $body.append(cre('a').attr('id', 'scroll-top').append(cre('i').addClass('fa fa-arrow-up')));
            theme._initScrollToTop();
        };

        theme.initSlimScroll = function (el, opts) {
            require(['plugins/jquery-slimscroll'], function () {
                $(el).each(function () {
                    if ( $(this).attr("data-initialized") ) {
                        return; // exit
                    }
                    var height = $(this).attr("data-height") ? $(this).attr("data-height") : $(this).css('height');
                    if ( ! defined(opts) ) {
                        opts = {};
                    }
                    var data = _.merge(Application.config('plugins.slimScroll'), $(this).data());
                    $(this).slimScroll(_.merge(data, opts));
                    $(this).attr("data-initialized", "1");
                });
            });
        };

        theme.destroySlimScroll = function (el) {
            $(el).each(function () {
                if ( $(this).attr("data-initialized") === "1" ) { // destroy existing instance before updating the height
                    $(this).removeAttr("data-initialized");
                    $(this).removeAttr("style");

                    var attrList = {};

                    // store the custom attribures so later we will reassign.
                    if ( $(this).attr("data-handle-color") ) {
                        attrList["data-handle-color"] = $(this).attr("data-handle-color");
                    }
                    if ( $(this).attr("data-wrapper-class") ) {
                        attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
                    }
                    if ( $(this).attr("data-rail-color") ) {
                        attrList["data-rail-color"] = $(this).attr("data-rail-color");
                    }
                    if ( $(this).attr("data-always-visible") ) {
                        attrList["data-always-visible"] = $(this).attr("data-always-visible");
                    }
                    if ( $(this).attr("data-rail-visible") ) {
                        attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
                    }

                    $(this).slimScroll({
                        wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                        destroy     : true
                    });

                    var the = $(this);

                    // reassign custom attributes
                    $.each(attrList, function (key, value) {
                        the.attr(key, value);
                    });

                }
            });
        };



        /** @deprecated todo: remove  */
        theme.scrollable = function ($el) {
            require(['plugins/mscrollbar'], function () {
                $.mCustomScrollbar.defaults.theme = 'dark';
                $el.addClass('mCustomScrollbar').mCustomScrollbar();
            });
        };



        /**
         * Spawns a 'toastr' notification
         * @param {string} fnName error, success, warning or info
         * @param {string} message
         * @param {string} title
         */
        theme.toastr = function (fnName, message, title) {
            require(['plugins/toastr'], function (toastr) {
                toastr[fnName].apply(toastr, [message, title]);
            });
        };

        theme.notify = theme.toastr;

        theme.alert = function (opt) {
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

            if ( title !== false ) {
                $alert.append(cre('strong').text(title));
            }

            $alert.append(cre('p').text(message));

            $('main > div.content').first()[insertFnName]($alert);
            setTimeout(function () {
                $alert.hide('slow');
                $alert.fadeOut('slow');
            }, delay);
        };


        theme.box = function (title, icon, actions) {
            var deferred = Application.defer();
            actions = defined(actions) ? actions : false;
            theme.getTemplate('box', function (template) {
                var $box = $(template({
                    title  : title,
                    icon   : icon,
                    actions: actions
                }));
                $box.$content = $box.find('section').first();
                $box.$actions = $box.find('> header > .actions').first();
                $box.createAction = function (id, name, classes, href) {
                    classes = defined(classes) ? classes : 'btn-primary';
                    href = defined(href) ? href : 'javascript:;';
                    $box.$actions[id] = cre('a')
                        .attr('href', href)
                        .attr('id', id)
                        .addClass('btn')
                        .addClass(classes)
                        .text(name);
                    $box.$actions.append($box.$actions[id]);
                    return $box.$actions[id];
                };
                theme.$hidden.append($box);
                deferred.resolve($box);
            });
            return deferred.promise();
        };

        theme.button = function (name, size, classes, type, href) {
            type = def(type, 'a');
            size = def(size, 'xs');
            classes = def(classes, '');
            type = def(type, 'a');
            href = def(href, 'javascript:;');

            var $button = cre(type)
                .addClass('btn btn-' + size)
                .addClass(classes);

            if ( type === 'a' ) {
                $button.attr('href', href).text(name);
            } else if ( type === 'button' ) {
                $button.val(name);
            }
            return $button;
        };

        theme.table = function (cols, rows, classes) {
            var deferred = Application.defer();
            theme.getTemplate('table', function (template) {
                var $table = $(template({
                    table: {
                        classes: classes,
                        cols   : def(cols, []),
                        rows   : def(rows, [])
                    }
                }));
                deferred.resolve($table);
            });
            return deferred.promise();
        };



        /**
         * Initializes the theme, should only be called once
         */
        theme.init = function () {
            /**
             * @event App#theme:init
             * @type {object}
             */
            Application.emit('theme:init', theme);

            theme.$window = $(window);
            theme.$document = $(window.document);

            theme._initEvents();
            theme._initHeaderSearchForm();
            theme._initSettingsEditor();
            theme._initScrollToTop();
            $([
                ".btn:not(.btn-link)",
                ".card-image",
                ".navbar a:not(.withoutripple)",
                ".dropdown-menu a",
                ".nav-tabs a:not(.withoutripple)",
                ".withripple"
            ].join(",")).addClass('withripple').ripples();


            $('body').on('shown.bs.collapse', '.accordion.scrollable', function (e) {
                theme.scrollTo($(e.target));
            });

            theme._initLayout();
            /**
             * @event App#theme:ready
             * @type {object}
             */
            Application.emit('theme:ready', theme);
        };

        return theme;
    });
