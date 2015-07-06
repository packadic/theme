///<reference path="../types.d.ts"/>
import {defined, def, cre} from 'app/util';
import {Config} from 'app/config';
import storage = require('app/storage');
import {Application} from 'app/application';

declare var packadic:any;

export class Layout {

    private _app:Application;
    private _sidebar:widgets.PackadicSidebarWidget;

    public $hidden:JQuery;
    public $window:JQuery;
    public $document:JQuery;
    public $body:JQuery;
    public $sidebar:JQuery;


    private lastSelectedLayout:string = '';

    constructor(app:Application) {
        this._app = app;
        this._app.config.allowSaveOn('layout');
        this._app.config.load('layout');
        /**
         * @event App#theme:init
         * @type {object}
         */
        this._app.emit('layout:init', this);
        require(['jquery', 'plugins/bootstrap'], function($){
            this.$hidden = cre().addClass('hide');
            this.$window = $(window);
            this.$document = $(window.document);
            $(function(){
                this.$body = $('body');
                this.$sidebar= $('.sidebar-nav-menu');
                this.initResizeEvent();
                this.initHeaderSearchForm();
                this.initSettingsEditor();
                this.initScrollToTop();


                if(this.config.ripples === true) {
                    $([
                        ".btn:not(.btn-link)",
                        ".card-image",
                        ".navbar a:not(.withoutripple)",
                        ".dropdown-menu a",
                        ".nav-tabs a:not(.withoutripple)",
                        ".withripple"
                    ].join(",")).addClass('withripple').ripples();
                }
                this.initLayout();
                /**
                 * @event App#theme:ready
                 * @type {object}
                 */
                this._app.emit('layout:ready', this);
            }.bind(this));
        }.bind(this));

    }

    public initSidebar(opts:any={}, callback?:any):JQueryPromise<any> {
        var defer = this._app.defer();
        require(['jquery', 'widgets/sidebar'], function($){
            this.$sidebar.sidebar(opts);
            this._sidebar = this.$sidebar.sidebar('instance');
            defer.resolve();
            if(callback) callback();
        }.bind(this));
        return defer.promise();
    }

    get config():any {
        return this._app.config('layout');
    }

    public get(opt) {
        return this._app.config.get('layout.' + opt);
    }

    public set(opt?:string, value?:any, refresh?:boolean, save?:boolean) {
        if (!defined(this.config[opt]) || !defined(value)) return;
        refresh = defined(refresh) ? refresh : true;
        save = defined(save) ? save : true;
        console.log('doing ', opt, ' with:', value, ' refresh:', refresh, 'save', save);
        this._app.config.set('layout.' + opt, value);
        if (save) this.save();
        if (refresh) this.applyLayout();
    }

    save() {
        this._app.config.save('layout');
        /**
         * Fires when the theme options are saved into the localStorage
         * @event module:theme~save
         * @type {object}
         */
        this._app.emit('layout:save', this.config);
    }

    load() {
        this._app.config.load('layout');
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
        var self:Layout = this;
        this.$window.on('resize', function () {
            setTimeout(function () {
                /**
                 * @event module:theme~resize
                 */
                self._app.emit('theme:resize', self, 'resize');
            }, 600); // delay the event a bit, otherwise it doesn't seem to work well in some cases
        });
    }

    initScrollToTop() {
        $('#scroll-top').off('click').on('click', function (e) {
            e.preventDefault();
            this._app.emit('theme:scrolltop');
            this._app.scrollTo(document.body, 0, 600);
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
        $('body').append(cre('a').attr('id', 'scroll-top').append(cre('i').addClass('fa fa-arrow-up')));
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
        if (this.config.sidebar.fixed == true) {
            this.set('top', 'fixed');
            this.set('sidebar.fixed', true);
        }

        this.resetLayout(); // reset layout to default state

        if (this.config.mode === "boxed") {
            this.$body.addClass("page-boxed");

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

        if (this.lastSelectedLayout != this.config) {
            //layout changed, run responsive handler:
            this._app.emit('theme:resize');
        }
        this.lastSelectedLayout = this.config;

        //header
        if (this.config.top === 'fixed') {
            this.$body.addClass("section-top-fixed");
            $("section#top").removeClass("navbar-static-top").addClass("navbar-fixed-top");
        } else if (this.config.top === 'normal') {
            this.$body.removeClass("section-top-fixed");
            $("section#top").removeClass("navbar-fixed-top").addClass("navbar-static-top");
        } else if (this.config.top === 'hidden') {
            this.$body.addClass('section-top-hidden');
        }

        //footer
        if (this.config.bottom === 'fixed') {
            this.$body.addClass("section-bottom-fixed");
        } else {
            this.$body.removeClass("section-bottom-fixed");
        }

        //sidebar
        if (this.config.sidebar.enabled === true) {
            if (this.$body.hasClass('page-full-width') === false) {
                if (this.config.sidebar.fixed === true) {
                    this.$body.addClass("sidebar-nav-fixed");
                    this.$sidebar.addClass("sidebar-nav-menu-fixed")
                        .removeClass("sidebar-nav-menu-default");

                    /*require(['theme/sidebar'], function (sidebar) {
                        sidebar.handleFixedHover();
                    });
                    */
                    //Layout.initFixedSidebarHoverEffect();
                } else {
                    this.$body.removeClass("sidebar-nav-fixed");
                    this.$sidebar.addClass("sidebar-nav-menu-default")
                        .removeClass("sidebar-nav-menu-fixed")
                        .unbind('mouseenter')
                        .unbind('mouseleave');
                }
            }


            //sidebar style
            if (this.config.sidebar.style === 'light') {
                this.$sidebar.addClass("sidebar-nav-menu-light");
            } else {
                this.$sidebar.removeClass("sidebar-nav-menu-light");
            }

            //sidebar menu
            if (this.config.sidebar.mode === 'hover') {
                if (this.config.sidebar.fixed == true) {
                    this.set('sidebar.mode', 'accordion');
                    alert("Hover Sidebar Menu is not compatible with Fixed Sidebar Mode. Select Default Sidebar Mode Instead.");
                } else {
                    this.$sidebar.addClass("sidebar-nav-menu-hover-submenu");
                }
            } else {
                this.$sidebar.removeClass("sidebar-nav-menu-hover-submenu");
            }

            if (this.config.sidebar.position === 'right') {
                this.$body.addClass("sidebar-nav-reversed");
                if($.fn.tooltip) {
                    $('#frontend-link')['tooltip']('destroy')['tooltip']({
                        placement: 'left'
                    });
                }
            } else {
                this.$body.removeClass("sidebar-nav-reversed");
                if($.fn.tooltip) {
                    $('#frontend-link')['tooltip']('destroy')['tooltip']({
                        placement: 'right'
                    });
                }
            }

            /*require(['theme/sidebar'], function (sidebar) {
                sidebar.handleWithContent(); // fix content height
                sidebar.handleFixed(); // reinitialize fixed sidebar
                /**
                 * Fires when the layout has been refreshed, which applies the theme options
                 * @event module:theme~layout
                 * @type {object}
                 *
                this._app.emit('theme:layout', this);
            }.bind(this));*/
        }
    }
}
