///<reference path="types.d.ts"/>
import $ = require('jquery');
import {defined, def, cre} from 'app/util';
import {Config} from 'app/config';
import storage = require('app/storage');
import spawner = require('spawner');

import _$cookie = require('plugins/cookie');
_$cookie;
import _$ripples = require('plugins/bs-material-ripples');
_$ripples;


var $body:JQuery = $('body'),
    $sidebarNavMenu:JQuery = $('.sidebar-nav-menu');
var App = window['App'];
class Theme {
    public static Theme:any  = Theme;
    public $hidden:JQuery;
    public $window:JQuery;
    public $document:JQuery;
    private lastSelectedLayout:string = '';

    constructor() {
        /**
         * @event App#theme:init
         * @type {object}
         */
        App.emit('theme:init', this);
        App.config.allowSaveOn('theme');
        App.config.load('theme');
        this.$hidden = cre().addClass('hide');
        this.$window = $(window);
        this.$document = $(window.document);

        this.init();

        /**
         * @event App#theme:ready
         * @type {object}
         */
        App.emit('theme:ready', this);
    }

    get config():any {
        return App.config('theme');
    }

    public get(opt) {
        if (!defined(this.config[opt])) {
            console.error('this.get failed on ', opt);
            return;
        }
        return this.config[opt];
    }

    public set(opt?:string, value?:any, refresh?:boolean, save?:boolean) {
        if (!defined(this.config[opt]) || !defined(value)) return;
        refresh = defined(refresh) ? refresh : true;
        save = defined(save) ? save : true;
        console.log('doing ', opt, ' with:', value, ' refresh:', refresh, 'save', save);
        App.config.set('theme.' + opt, value);
        if (save) this.save();
        if (refresh) this.applyLayout();
    }

    save() {
        App.config.save('theme');
        /**
         * Fires when the theme options are saved into the localStorage
         * @event module:theme~save
         * @type {object}
         */
        App.emit('theme:save', this.config);
    }

    load() {
        App.config.load('theme');
    }

    public init() {
        App.config.load('theme');
        this.initResizeEvent();
        this.initHeaderSearchForm();
        this.initSettingsEditor();
        this.initScrollToTop();

        $([
            ".btn:not(.btn-link)",
            ".card-image",
            ".navbar a:not(.withoutripple)",
            ".dropdown-menu a",
            ".nav-tabs a:not(.withoutripple)",
            ".withripple"
        ].join(",")).addClass('withripple').ripples();

        this.initLayout();

    }

    initLayout() {
        this.applyLayout();
    }

    initSettingsEditor() {
        var $el = $('.settings-editor');
        $el.find('> .btn').on('click', function (e) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
        })
    }

    initHeaderSearchForm() {
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
    }

    initResizeEvent() {
        this.$window.on('resize', function () {
            setTimeout(function () {
                /**
                 * @event module:theme~resize
                 */
                App.emit('theme:resize', this, 'resize');
            }, 600); // delay the event a bit, otherwise it doesn't seem to work well in some cases
        });
    }

    initScrollToTop() {
        $('#scroll-top').off('click').on('click', function (e) {
            e.preventDefault();
            App.emit('theme:scrolltop');
            App.scrollTo(document.body, 0, 600);
        })
    }

    reset(save) {

    }

    public hasSidebar() {
        return $('nav.sidebar-nav').length > 0;
    }

    public createLoader(name) {
        name = name || 'dark';
        return cre().addClass('loader').addClass('loader-' + name)
    }

    public ensureScrollToTop() {
        if ($('#scroll-top').length > 0) return;
        $body.append(cre('a').attr('id', 'scroll-top').append(cre('i').addClass('fa fa-arrow-up')));
        this.initScrollToTop();
    }

    resetLayout() {
        $("body").
            removeClass("page-boxed").
            removeClass("section-bottom-fixed").
            removeClass("sidebar-nav-fixed").
            removeClass("section-top-fixed").
            removeClass('section-top-hidden').
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
    }

    public applyLayout() {

        if (this.config.sidebarOption == "fixed") {
            this.set('top', 'fixed');
            this.set('sidebarOption', 'fixed');
        }

        this.resetLayout(); // reset layout to default state

        if (this.config.layout === "boxed") {
            $body.addClass("page-boxed");

            // set header
            $('section#top > header.top').addClass("container");
            var cont = $('body > .clearfix').after('<div class="container"></div>');

            // set content
            $('section#page').appendTo('body > .container');

            // set footer
            if (this.config.bottom === 'fixed') {
                $('section#bottom').html('<div class="container">' + $('section#bottom').html() + '</div>');
            } else {
                $('section#bottom').appendTo('body > .container');
            }
        }

        if (this.lastSelectedLayout != this.config.layout) {
            //layout changed, run responsive handler:
            App.emit('theme:resize');
        }
        this.lastSelectedLayout = this.config.layout;

        //header
        if (this.config.top === 'fixed') {
            $body.addClass("section-top-fixed");
            $("section#top").removeClass("navbar-static-top").addClass("navbar-fixed-top");
        } else if (this.config.top === 'normal') {
            $body.removeClass("section-top-fixed");
            $("section#top").removeClass("navbar-fixed-top").addClass("navbar-static-top");
        } else if (this.config.top === 'hidden') {
            $body.addClass('section-top-hidden');
        }

        //footer
        if (this.config.bottom === 'fixed') {
            $body.addClass("section-bottom-fixed");
        } else {
            $body.removeClass("section-bottom-fixed");
        }

        //sidebar
        if (!this.config.sidebarDisabled) {
            if ($body.hasClass('page-full-width') === false) {
                if (this.config.sidebarOption === 'fixed') {
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


            //sidebar style
            if (this.config.sidebarStyle === 'light') {
                $sidebarNavMenu.addClass("sidebar-nav-menu-light");
            } else {
                $sidebarNavMenu.removeClass("sidebar-nav-menu-light");
            }

            //sidebar menu
            if (this.config.sidebarTraverse === 'hover') {
                if (this.config.sidebarOption == 'fixed') {
                    this.set('sidebarTraverse', 'accordion');
                    alert("Hover Sidebar Menu is not compatible with Fixed Sidebar Mode. Select Default Sidebar Mode Instead.");
                } else {
                    $sidebarNavMenu.addClass("sidebar-nav-menu-hover-submenu");
                }
            } else {
                $sidebarNavMenu.removeClass("sidebar-nav-menu-hover-submenu");
            }

            if (this.config.sidebarPosition === 'right') {
                $body.addClass("sidebar-nav-reversed");
                $('#frontend-link')['tooltip']('destroy')['tooltip']({
                    placement: 'left'
                });
            } else {
                $body.removeClass("sidebar-nav-reversed");
                $('#frontend-link')['tooltip']('destroy')['tooltip']({
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
                App.emit('theme:layout', this.options);
            });
        }
    }
}

var theme:Theme = new Theme();
export = theme;
