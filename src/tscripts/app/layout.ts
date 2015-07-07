///<reference path="../types.d.ts"/>
import {defined, def, cre} from 'app/util';
import {Config} from 'app/config';
import storage = require('app/storage');
import {Application} from 'app/application';

declare var packadic:any;

export class Layout {

    private _app:Application;
    public sidebar:widgets.PackadicSidebarWidget;

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
            $.packadic.sidebar.prototype.defaults = this._app.config('widgets.sidebar');
            this.$sidebar.sidebar(opts);
            this.sidebar = this.$sidebar.sidebar('instance');
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

    public set(opt?:string, value?:any, refresh:boolean=true, save:boolean=false) {
        console.log('doing ', opt, ' with:', value, ' refresh:', refresh, 'save', save);
        this._app.config.set('layout.' + opt, value);
        if (save) this.save();
        if (refresh) this.applyLayout();
    }

    public save() {
        this._app.config.save('layout');
        /**
         * Fires when the theme options are saved into the localStorage
         * @event module:theme~save
         * @type {object}
         */
        this._app.emit('layout:save', this.config);
    }

    public load() {
        this._app.config.load('layout');
    }

    public reset(refresh?:boolean, save?:boolean){

    }

    protected initLayout() {
        this.applyLayout();
    }

    protected initSettingsEditor() {
        var $el = $('.settings-editor');
        $el.find('> .btn').on('click', function (e) {
            e.preventDefault();
            $(this).parent().toggleClass('active');
        })
    }

    protected initHeaderSearchForm() {
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

    protected initResizeEvent() {
        var self:Layout = this;
        this.$window.on('resize', function () {
            setTimeout(function () {
                /**
                 * @event module:theme~resize
                 */
                self._app.emit('layout:resize', self, 'resize');
            }, 600); // delay the event a bit, otherwise it doesn't seem to work well in some cases
        });
    }

    protected initScrollToTop() {
        var self:Layout = this;
        $('#scroll-top').off('click').on('click', function (e) {
            e.preventDefault();
            self._app.emit('layout:scrolltop');
            self._app.scrollTo(document.body, 0, 600);
        })
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

    protected resetLayout() {
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
            this.set('top', 'fixed', false, false);
            this.set('sidebar.fixed', true, false, false);
        }

        this.resetLayout();
        this._applyLayoutMode();
        this._applyLayoutTop();
        this._applyLayoutBottom();
        this._applyLayoutSidebar();

        this.lastSelectedLayout = this.config;
        if (this.lastSelectedLayout != this.config) {
            this._app.emit('layout:resize');
        }
    }

    protected _applyLayoutMode(){
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
    }

    protected _applyLayoutTop() {
        if (this.config.top === 'fixed') {
            this.$body.addClass("section-top-fixed");
            $("section#top").removeClass("navbar-static-top").addClass("navbar-fixed-top");
        } else if (this.config.top === 'normal') {
            this.$body.removeClass("section-top-fixed");
            $("section#top").removeClass("navbar-fixed-top").addClass("navbar-static-top");
        } else if (this.config.top === 'hidden') {
            this.$body.addClass('section-top-hidden');
        }
    }

    protected _applyLayoutBottom(){
        if (this.config.bottom === 'fixed') {
            this.$body.addClass("section-bottom-fixed");
        } else {
            this.$body.removeClass("section-bottom-fixed");
        }
    }

    protected _applyLayoutSidebar(){

        if (this.config.sidebar.enabled !== true) return;

        if (this.$body.hasClass('page-full-width') === false) {
            if (this.config.sidebar.fixed === true) {
                this.$body.addClass("sidebar-nav-fixed");
                this.$sidebar.addClass("sidebar-nav-menu-fixed")
                    .removeClass("sidebar-nav-menu-default");
                if($.fn.sidebar) {
                    this.sidebar._handleFixedHover();
                }
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

        // position
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

        if($.fn.sidebar) {
            this.sidebar._handleFixed();
        }
    }
}
