///<reference path="../types.d.ts"/>
import $ = require('jquery');
import {def, defined, cre, trim} from 'app/util';
import widgets = require('widgets');
import spawner = require('spawner');
import async = require('async');

var App = window['App'];
var $body:JQuery = $('body');


var calculateFixedHeight = function () {
    var sidebarHeight = App.getViewPort().height - $('section#top').outerHeight();
    if ($body.hasClass("section-bottom-fixed")) {
        sidebarHeight = sidebarHeight - $('section#bottom').outerHeight();
    }

    return sidebarHeight;
};

//var $sidebarNavMenu = $('ul.sidebar-nav-menu');
//var $sidebarNav = $sidebarNavMenu.parent();

export class PackadicSidebarWidget extends widgets.WidgetBase implements IWidget {
    public version:string = '1.0.0';
    public widgetEventPrefix:string = 'sidebar.';
    public openCloseInProgress:boolean = false;
    public $nav:JQuery;

    public options:any = {
        hidden: false,
        items: null,
        resolveActive: true,
        openCloseDuration: 600,
        openedWidth: 235,
        closedWidth: 45,
        autoScroll: true,
        slideSpeed: 200,
        keepExpanded: false,
        toggler: '.sidebar-toggler',
        slimScroll: {
            allowPageScroll: false
        }
    };

    constructor() {
        super();
    }


    public  _getDataAttributes() {
        var data:any = this.element.prefixedData('sidebar');
        if (defined(data.controls)) {
            data.controls = data.controls.split(',');
        }
        return data;
    }

    protected _onResize(){
        if ( this.options.hidden ) {
            return;
        }
        this._handleFixed();
    }

    protected _bind() {
        var self:PackadicSidebarWidget = this;
        self.bindings.unbind( this.eventNamespace );
        /**
         * @event App#sidebar:init
         * @type {object}
         */
        self._handleFixed();
        self._handle();
        //this._handleToggler();
        App.on('theme:resize', self._onResize.bind(self) );
        self._resolveActiveLink();
        self.hideLoader();
        if ( self.options.hidden ) {
            self.hide();
        }
        /**
         * @event App#sidebar:ready
         * @type {object}
         */
        self._trigger('created');
    }

    public  _create() {
        var self:PackadicSidebarWidget = this;
        this.$nav = this.element.parent();
        this.options = $.extend(true, this.options, this._getDataAttributes());
        this.options.openedWidth = $body.hasClass("sidebar-nav-closed") ? 235 : parseInt(this.$nav.css('width'));

        if (this.options.items) {
            this._generateFromTemplate(this.options.items).then(function(){
                self._bind();
            });
        } else {
            self._bind();
        }

    }

    public showLoader() {
        this._trigger('loader:show');
        this.hide();
        this.$nav.find('.loader.loader-light').show();
    }

    public hideLoader() {
        this._trigger('loader:hide');
        this.$nav.find('.loader.loader-light').hide();
        this.show();
    }

    /**
     * Checks if the sidebar is fixed
     * @returns {boolean}
     */
    public isFixed() {
        return $body.hasClass('sidebar-nav-fixed')
    }

    /**
     * Checks if the sidebar is closed
     * @returns {boolean}
     */
    public isClosed() {
        return $body.hasClass('sidebar-nav-closed')
    }


    public close(callback?:any):JQueryPromise<any> {
        var self:PackadicSidebarWidget = this;
        var $main = $('main');

        if (self.openCloseInProgress || self.isClosed()) {
            return;
        }
        self.openCloseInProgress = true;
        var defer:any = App.defer();
        $body.addClass('sidebar-nav-closing');

        var $title = this.element.find('li a span.title, li a span.arrow');

        // close all sub-menus
        this.element.find('ul.sub-menu').each(function () {
            var $ul:JQuery = $(this);
            if ($ul.is(":visible")) {
                $('.arrow', $ul).removeClass("open");
                $ul.parent().removeClass("open");
                $ul.slideUp(self.options.slideSpeed);
            }
        });

        async.parallel([
            function (cb:any) {
                $main.animate({
                    'margin-left': self.options.closedWidth
                }, self.options.openCloseDuration, function () {
                    console.log('closed $main');
                    cb();
                })
            },
            function (cb:any) {
                self.$nav.animate({
                    width: self.options.closedWidth
                }, self.options.openCloseDuration, function () {
                    console.log('closed $sidbenav');
                    cb();
                })
            },
            function (cb:any) {
                var closed = 0;
                $title.animate({
                    opacity: 0
                }, self.options.openCloseDuration / 3, function () {
                    closed++;
                    if (closed == $title.length) {
                        $title.css('display', 'none');
                        cb();
                    }
                })
            }
        ], function (err, results) {

            $main.removeAttr('style');
            self.$nav.removeAttr('style');
            $title.removeAttr('style');

            $body
                .addClass("sidebar-nav-closed")
                .removeClass('sidebar-nav-closing');
            self.element.addClass("sidebar-nav-menu-closed");

            if (self.isFixed()) {
                self.element.trigger("mouseleave");
            }

            if ($.cookie) {
                $.cookie('sidebar_closed', '1');
            }
            self.openCloseInProgress = false;

            if (_.isFunction(callback)) {
                callback();
            }
            defer.resolve();
        });
        return defer.promise();
    }

    public open(callback?:any):JQueryPromise<any> {
        var self:PackadicSidebarWidget = this;
        var $main = $('main');
        if (self.openCloseInProgress || !self.isClosed()) {
            return;
        }

        self.openCloseInProgress = true;
        var defer:any = App.defer();

        var $title:JQuery = self.element.find('li a span.title, li a span.arrow');

        $body.removeClass("sidebar-nav-closed");
        self.element.removeClass("sidebar-nav-menu-closed");

        async.parallel([
            function (cb:any) {
                $main.css('margin-left', self.options.closedWidth)
                    .animate({
                        'margin-left': self.options.openedWidth
                    }, self.options.openCloseDuration, function () {
                        cb();
                    })
            },
            function (cb:any) {
                self.$nav.css('width', self.options.closedWidth)
                    .animate({
                        width: self.options.openedWidth
                    }, self.options.openCloseDuration, function () {
                        cb();
                    })
            },
            function (cb:any) {
                var opened = 0;

                $title.css({
                    opacity: 0,
                    display: 'none'
                });
                setTimeout(function () {

                    $title.css('display', 'initial');
                    $title.animate({
                        opacity: 1
                    }, self.options.openCloseDuration / 2, function () {
                        opened++;
                        if (opened == $title.length) {
                            $title.css('display', 'none');
                            cb();
                        }
                    })
                }, self.options.openCloseDuration / 2)
            }
        ], function (err, results) {

            $main.removeAttr('style');
            self.$nav.removeAttr('style');
            $title.removeAttr('style');

            if ($.cookie) {
                $.cookie('sidebar_closed', '0');
            }

            self.openCloseInProgress = false;
            if (_.isFunction(callback)) {
                callback();
            }
            defer.resolve();
        });
        defer.promise();
    }

    public hide() {
        if (this.options.hidden) {
            return;
        }
        this.options.hidden = true;
        if (!$body.hasClass('sidebar-nav-closed')) {
            $body.addClass('sidebar-nav-closed');
        }
        if (!$body.hasClass('sidebar-nav-hide')) {
            $body.addClass('sidebar-nav-hide');
        }
        $('header.top .sidebar-toggler').hide();
    }

    public show() {
        this.options.hidden = false;
        $body.removeClass('sidebar-nav-closed')
            .removeClass('sidebar-nav-hide');
        $('header.top .sidebar-toggler').show();
    }

    protected _getSubmenuParents():JQuery {
        return this.element.find('li > .sub-menu').filter(function (i) {
            return $(this).css('caption-side') == 'bottom' || $(this).children('ul').first().hasClass('sub-menu-hover');
        }).parent();
    }

    protected _handle () {
        var self:PackadicSidebarWidget = this;
        var breakpointMd = App.getBreakpoint('md');

        self._on(self._getSubmenuParents(), {
            'mouseenter': function (e) {
                console.log('mouseenter');
                var $el:JQuery = $(e.target);
                $el.children('a').first().clone().addClass('sub-menu-title').prependTo($el);
            },
            'mouseleave': function (e) {
                console.log('mouseleave');
                var $el:JQuery = $(e.target);
                $el.find('.sub-menu-title').remove();
            }
        });

        //$sidebar.find('li.open').has('ul.sub-menu').
        self._on(this.element, {
            'click li > a': function (e) {
                var $el:JQuery = $(e.target);
                var hasSubMenu = $el.next().hasClass('sub-menu');

                if ( App.getViewPort().width >= breakpointMd && $el.parents('.sidebar-nav-menu-hover-submenu').length === 1 ) { // exit of hover sidebar menu
                    return;
                }

                if ( hasSubMenu === false ) {
                    if ( App.getViewPort().width < breakpointMd && $('.sidebar-nav').hasClass("in") ) { // close the menu on mobile view while laoding a page
                        $('section#top .responsive-toggler').click();
                    }
                    return;
                }

                if ( $el.next().hasClass('sub-menu always-open') ) {
                    return;
                }

                var parent = $el.parent().parent();
                var the = $el;
                var sub = $el.next();

                if ( self.options.keepExpanded !== true ) {
                    parent.children('li.open').children('a').children('.arrow').removeClass('open');
                    parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(self.options.slideSpeed);
                    parent.children('li.open').removeClass('open');
                }

                var slideOffeset = - 200;

                if ( sub.is(":visible") ) {
                    $('.arrow', $el).removeClass("open");
                    $el.parent().removeClass("open");
                    sub.slideUp(self.options.slideSpeed);
                } else if ( hasSubMenu ) {
                    $('.arrow', $el).addClass("open");
                    $el.parent().addClass("open");
                    sub.slideDown(self.options.slideSpeed);
                }

                e.preventDefault();
            }
        });
    }
    protected _enableScrollbar(opts:any={}){
        spawner.initSlimScroll(this.element, $.extend(true, this.options.slimScroll, opts));
    }
    protected _disableScrollbar(){
        spawner.destroySlimScroll(this.element)
    }

    protected _handleFixed(){

        this._disableScrollbar();

        var width = App.getViewPort().width;
        var breakpointMd = App.getBreakpoint('md');

        if ( width < breakpointMd && ! this.$nav.hasClass('collapse') ) {
            this.$nav.addClass('collapse');
        }

        if ( ! this.isFixed() ) {
            this._handleWithContent();
            return;
        }

        if ( width >= breakpointMd ) {
            //this.element.attr("data-height", calculateFixedHeight());
            this._enableScrollbar({ height: calculateFixedHeight() }); //, sidebar.options.scroller);
            this._handleWithContent();
        }
    }

    protected _handleWithContent(){
        var breakpointMd = App.getBreakpoint('md');
        var content = $('main');

        var height;

        if ( $body.hasClass("section-bottom-fixed") === true && this.isFixed() === false ) {
            var available_height = App.getViewPort().height - $('section#bottom').outerHeight() - $('section#top').outerHeight();
            if ( content.height() < available_height ) {
                content.attr('style', 'min-height:' + available_height + 'px');
            }
        } else {
            if ( this.isFixed() ) {
                height = calculateFixedHeight();
                if ( $body.hasClass('section-bottom-fixed') === false ) {
                    height = height - $('section#bottom').outerHeight();
                }
            } else {
                var headerHeight = $('section#top').outerHeight();
                var footerHeight = $('section#bottom').outerHeight();

                if ( App.getViewPort().width < breakpointMd ) {
                    height = App.getViewPort().height - headerHeight - footerHeight;
                } else {
                    height = this.element.height() + 20;
                }

                if ( (height + headerHeight + footerHeight) <= App.getViewPort().height ) {
                    height = App.getViewPort().height - headerHeight - footerHeight;
                }
            }
            content.attr('style', 'min-height:' + height + 'px');
        }
    }

    protected _handleFixedHover () {
        var self:PackadicSidebarWidget = this;
        if ( self.isFixed() ) {
            self._on(self.$nav, {
                'mouseenter': function (e) {
                    if ($body.hasClass('sidebar-nav-closed')) {
                        $(e.target).find('.sidebar-nav-menu').removeClass('sidebar-nav-menu-closed');
                    }
                },
                'mouseleave': function (e) {
                    if (self.isClosed()) {
                        $(e.target).find('.sidebar-nav-menu').addClass('sidebar-nav-menu-closed');
                    }
                }
            });
        }
    }

    protected _handleToggler() {
        var self:PackadicSidebarWidget = this;

        if ( $.cookie && $.cookie('sidebar_closed') === '1' && App.getViewPort().width >= App.getBreakpoint('md') ) {
            $body.addClass('sidebar-nav-closed');
            this.element.addClass('sidebar-nav-menu-closed');
        }

        // handle sidebar show/hide
        this._on(this.document, {
            'click .sidebar-toggler': function (e) {
                if (self.openCloseInProgress) {
                    return;
                }
                $(".sidebar-search", self).removeClass("open");
                self[self.isClosed() ? 'open' : 'close']().then(function(){
                    self.window.trigger('resize');
                });
            }
        });
    }

    protected _resolveActiveLink() {
        if(this.options.resolveActive !== true) return;
        var currentPath = trim(location.pathname.toLowerCase(), '/');
        var md = App.getBreakpoint('md');
        if (App.getViewPort().width < md) {
            return; // not gonna do this for small devices
        }
        this.element.find('a').each(function () {
            var href:string = this.getAttribute('href');
            if (!_.isString(href)) {
                return;
            }
            href = trim(href).replace(location['origin'], '');
            var path = trim(href, '/');
            if (path == currentPath) {
                console.log('found result', this);
                var $el = $(this);
                $el.parent('li').not('.active').addClass('active');
                var $parentsLi = $el.parents('li').addClass('open');
                $parentsLi.find('.arrow').addClass('open');
                $parentsLi.has('ul').children('ul').show();
            }
        })

    }



    protected _generateFromTemplate(menuItems, templateName?:any, callback?:any):JQueryPromise<any> {
        var self:PackadicSidebarWidget = this;
        var defer = App.defer();
        this._trigger('generate');
        if (_.isFunction(templateName)) {
            callback = templateName;
        }

        if (!_.isString(templateName)) {
            templateName = 'sidebar';
        }

        // logDebug('getting template', templateName, menuItems);
        App.getTemplate(templateName, function (template) {
            //  logDebug('got template');
            var html = template({items: menuItems});
            $('ul.sidebar-nav-menu').html('').html(html);
            self._trigger('generated');
            if (_.isFunction(callback)) {
                callback();
            }
            defer.resolve();
        });
        return defer.promise()
    }

    public _trigger(type:String, args?:any[], data?:Object):any {
        App.emit('sidebar:' + type);
        this._superApply(arguments);
    }

    public _destroy() {

    }

    //  Any time the plugin is alled with no arguments or with only an option hash,
    // the widget is initialized; this includes when the widget is created.
    public _init():any {
        return undefined;
    }

    public _setOption(key:string, value:any):any {
        var self:PackadicSidebarWidget = this;
            switch(key){
                case 'hidden':
                    if(value === true){
                        self.hide();
                    } else {
                        self.show();
                    }
                    break;
                case 'items':
                    self._generateFromTemplate(self.options.items);
                    break;
            }
            /*

             hidden: false,
             items: null,
             resolveActive: true,
             openCloseDuration: 600,
             openedWidth: 235,
             closedWidth: 45,
             autoScroll: true,
             slideSpeed: 200,
             keepExpanded: false,
             toggler: '.sidebar-toggler'
             */
        this._super(key, value);
        return this;
    }

}

widgets.make('packadic.sidebar', new PackadicSidebarWidget());

