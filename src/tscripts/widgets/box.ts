///<reference path="../types.d.ts"/>
import $ = require('jquery');
import {def, defined, cre} from 'app/util';
import widgets = require('widgets');
import _$blockUI = require('plugins/blockui');
_$blockUI;


var App = window['App'];
var $body:any = $('body');


export class PackadicBoxWidget extends widgets.WidgetBase implements IWidget {
    public version:string = '1.0.0';
    public widgetEventPrefix:string = 'box.';

    public $section:JQuery;
    public $header:JQuery;
    public $headerRight:JQuery;
    public $controls:JQuery;
    public $close:JQuery;
    public $minimize:JQuery;
    public $move:JQuery;
    public $fullscreen:JQuery;

    public options:any = {
        controls: ['close', 'minimize', 'move', 'fullscreen'],
        slideSpeed: 300,

        minimized: false,
        closed: false,
        fullscreen: false,

        iconMinimize: 'fa-chevron-up',
        iconMaximize: 'fa-chevron-down',

        iconFullscreen: 'fa-expand',
        iconExitFullscreen: 'fa-compress',

        hide: {effect: "explode", duration: 300},
        show: {effect: "blind", duration: 300},

        blockUI: {
            css: {
                backgroundColor: '#FFF',
                width: '35px',
                padding: 2,
                border: '1px solid #aaa'
            }
        },

        draggable: {
            handle: null, // if null then handle is automaticly set to this.$move
            stop: this._hideTooltips
        }
    };

    protected minmaxingInProgress = false;
    protected loading = false;

    constructor() {
        super();
    }

    // OPEN/CLOSER
    public open(cb?:Function):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        self._show(self.element, self.options.show, function () {
            if (_.isFunction(cb)) {
                cb(this);
            }
        });
        return this;
    }

    public close(cb?:Function):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        self._hide(self.element, self.options.hide, function () {
            if (self.isFullscreen()) {
                self.exitFullscreen();
            }
            if (self.isLoading()) {
                self.stopLoader();
            }
            if (_.isFunction(cb)) {
                cb(this);
            }
        });
        return this;
    }

    // MAXIMIZER
    public minimizeContent(cb?:Function):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (!self.minmaxingInProgress && !self.isFullscreen()) {
            self.minmaxingInProgress = true;
            self.$section.slideUp(self.options.slideSpeed, function (event) {
                self.options.minimized = true;
                self.minmaxingInProgress = false;
                if (self.$minimize && self.$minimize.$i) {
                    self.$minimize.$i.removeClass(self.options.iconMinimize).addClass(self.options.iconMaximize);
                }
                if (_.isFunction(cb)) {
                    cb();
                }
                self._trigger('minimize', event);
            });
        }
        return this;
    }

    public maximizeContent(cb?:Function):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (!self.minmaxingInProgress && !self.isFullscreen()) {
            self.minmaxingInProgress = true;
            self.$section.slideDown(self.options.slideSpeed, function (event) {
                self.options.minimized = false;
                self.minmaxingInProgress = false;
                if (self.$minimize && self.$minimize.$i) {
                    self.$minimize.$i.removeClass(self.options.iconMaximize).addClass(self.options.iconMinimize);
                }
                if (_.isFunction(cb)) {
                    cb();
                }
                self._trigger('maximize', event);
            });
        }
        return this;
    }

    public toggleContent(cb?:Function):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (this.options.minimized) {
            this.maximizeContent(cb);
        } else {
            this.minimizeContent(cb);
        }
        return this;
    }

    // FULLSCREEN
    public fullscreen():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (!this.isFullscreen()) {
            this.maximizeContent();
            this._hideTooltips();
            this.disableMove();
            this.element.addClass('box-fullscreen');
            $body.addClass('fullscreen');
            if (self.$fullscreen && self.$fullscreen.$i) {
                self.$fullscreen.$i.removeClass(self.options.iconFullscreen).addClass(self.options.iconExitFullscreen);
            }
        }
        return this;
    }

    public exitFullscreen():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (this.isFullscreen()) {
            this._hideTooltips();
            this.element.removeClass('box-fullscreen');
            $body.removeClass('fullscreen');
            this.enableMove();
            if (self.$fullscreen && self.$fullscreen.$i) {
                self.$fullscreen.$i.removeClass(self.options.iconExitFullscreen).addClass(self.options.iconFullscreen);
            }
        }
        return this;
    }

    public toggleFullscreen():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.fullscreen();
        }
        return this;
    }

    // LOADER
    public startLoader():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (!self.loading) {
            self.loading = true;
            self.element.block($.extend(true, App.config('plugins.blockUI'), self.options.blockUI, {}));
            self._trigger('loading');
        }
        return this;
    }

    public stopLoader():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (self.loading) {
            self.element.unblock();
            self.loading = false;
            self._trigger('loaded');
        }
        return this;
    }

    public toggleLoader():PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (self.loading) {
            this.stopLoader();
        } else {
            this.startLoader();
        }
        return this;
    }

    // MOVER / DRAGGABLE
    public initMove(opts:any = {}):PackadicBoxWidget {
        if (!this.isDraggable()) {
            this.element.draggable($.extend(true, this.options.draggable, opts));
        }
        return this;
    }

    public enableMove(opts:any = {}):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (this.isDraggable() && this.isDraggableDisabled()) {
            this.element.draggable('enable');
        }
        return this;
    }

    public disableMove(destroy:boolean=false):PackadicBoxWidget {
        var self:PackadicBoxWidget = this;
        if (this.isDraggable() && !this.isDraggableDisabled()) {
            this.element.draggable(destroy ? 'destroy' : 'disable');
        }
        return this;
    }

    // HAS/IS CHECK FUNCTIONS
    public isFullscreen():boolean {
        return this.element.hasClass('box-fullscreen') && $body.hasClass('fullscreen');
    }

    public isLoading():boolean {
        return this.loading;
    }

    public isResizing():boolean {
        return this.minmaxingInProgress;
    }

    public hasControl(name:string):boolean {
        return this.options.controls.indexOf(name) !== -1
    }

    public isDraggable():boolean {
        return this.element.is(":data('ui-draggable')");
    }

    public isDraggableDisabled():boolean {
        if (!this.isDraggable()) return false;
        return this.element.draggable("option", "disabled");
    }

    // WIDGET
    protected  _getDataAttributes() {
        var data:any = this.element.prefixedData('box');
        if (typeof(data.controls) === 'string') {
            data.controls = data.controls.split(',');
        }
        return data;
    }

    public _create() {
        var self:PackadicBoxWidget = this;
        this.$section = this.element.find('> section');
        this.$header = this.element.find('> header');

        this.options = $.extend(true, this.options, this._getDataAttributes());

        if (this.options.controls.length > 0) {
            this._ensureControlsContainer();
            $.each(this.options.controls, function (i, control) {
                self['_createControl' + control.charAt(0).toUpperCase() + control.substring(1)].call(self);
            });
        }

        App.autoload.scan(this.element);
    }

    protected _getControl(type) {
        return this.$controls.find('a[data-box-control="' + type + '"]');
    }

    protected  _createControl(typeName, iconClass, tooltip?:string):JQuery {
        var $a:JQuery;
        $a = this.$controls.find('a[data-box-control="' + typeName + '"]');
        if ($a.length > 0) {
            $a.$i = $a.find('> i');
        } else {
            var $i = cre('i').addClass(iconClass);
            $a = cre('a')
                .attr('data-box-control', typeName)
                .append($i)
                .attr('href', '#');
            $a.$i = $i;
        }
        if(tooltip){
            $a.attr({
                'data-toggle': 'tooltip',
                title: tooltip
            });
            this._on($a, {
                'mouseleave': function(event){
                    this._hideTooltips();
                }
            });
        }
        return $a;
    }

    protected _createControlClose() {
        //console.log('_createControlClose');
        var self:PackadicBoxWidget = this;
        this.$close = this._createControl('close', 'fa fa-times', 'Close');
        this.$controls.append(this.$close);
        this._off(this.$close, 'click');
        this._on(this.$close, {
            click: function (event) {
                event.preventDefault();
                self.close();
            }
        });
    }

    protected _createControlMinimize() {
        //console.log('_createControlMinimize');
        var self:PackadicBoxWidget = this;
        this.$minimize = this._createControl('minimize', 'fa ' + this.options.iconMinimize, 'Toggle content');
        this.$controls.append(this.$minimize);
        this._off(this.$minimize, 'click');
        this._on(this.$minimize, {
            click: function (event) {
                event.preventDefault();
                self.toggleContent();
            }
        });
    }

    protected _createControlMove() {
        //console.log('_createControlMove');
        this.$move = this._createControl('move', 'fa fa-arrows', 'Move');
        this.$controls.append(this.$move);
        if(this.options.draggable.handle === null) {
            this.options.draggable.handle = this.$move;
        }
        this.initMove();
    }

    protected _createControlFullscreen() {
        //console.log('_createControlFullscreen');
        var self:PackadicBoxWidget = this;
        this.$fullscreen = this._createControl('fullscreen', 'fa fa-expand', 'Toggle fullscreen');
        this.$controls.append(this.$fullscreen);
        this._off(this.$fullscreen, 'click');
        this._on(this.$fullscreen, {
            click: function (event) {
                event.preventDefault();
                self.toggleFullscreen();
            }
        });
    }

    protected _ensureControlsContainer() {
        var $headerRight:JQuery = this.$header.find('> .right');
        if($headerRight.length == 0){
            $headerRight = cre().addClass('right').appendTo(this.$header);
        }
        this.$headerRight = $headerRight;

        var $actions = this.$headerRight.find('.actions');
        var $controls = this.$headerRight.find('.controls');
        if ($controls.length == 0) {
            $controls = cre().addClass('controls');
            this.$headerRight.append($controls)
        }
        this.$controls = $controls;
    }

    public _hideTooltips(){
        $(":data('bs.tooltip')").tooltip('hide');
    }

    public _destroy() {
        if (this.options.scroll) {
            App.theme('destroySlimScroll', this.element.find('> section'));
        }
    }

    //  Any time the plugin is alled with no arguments or with only an option hash,
    // the widget is initialized; this includes when the widget is created.
    public _init():any {
        return undefined;
    }

    public _setOptions(options):any {
        var that = this;

        $.each(options, function (key, value) {
            if (key == "draggable" || key == "droppable" || key == 'closeable') {
                value = value === "true";
            }
            that._setOption(String(key), value);
        });
        return this;
    }

}

widgets.make('packadic.box', new PackadicBoxWidget());

