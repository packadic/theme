///<reference path="types.d.ts"/>
import $ = require('jquery');
import {def, defined, cre} from 'app/util';

import _$widget = require('jquery-ui/widget');
import _$draggable = require('jquery-ui/draggable');
_$widget; // fake using it for forcing it to load with requirejs
_$draggable; // typescript otherwise omits the modules....


var App = window['App'];
module widgets {
    var $body:any = $('body');


    export class WidgetBase {
        _create():any {
            return undefined;
        }

        _destroy() {
        }

        _init():any {
            return undefined;
        }

        public _delay(fn:any, delay:number):number {
            return undefined;
        }


        public _focusable(element:JQuery):any {
            return undefined;
        }

        public _getCreateEventData():Object {
            return undefined;
        }

        public _getCreateOptions():Object {
            return undefined;
        }

        public _hide(element:JQuery, option:Object, callback:Function):any {
            return undefined;
        }

        public _hoverable(element:JQuery):any {
            return undefined;
        }


        public _off(element:JQuery, eventName:string):any {
            return undefined;
        }

        public _on(element:JQuery, handlers:Object):any {
            return undefined;
        }

        public _setOption(key:string, value:Object):any {
            return undefined;
        }

        public _setOptions(options:Object):any {
            return undefined;
        }

        public _show(element:JQuery, option:Object, callback:Function):any {
            return undefined;
        }

        public _super(arg:Object) {
        }

        public _superApply(args:Array<any>) {
        }

        public _trigger(type:String, args?:any[], data?:Object):any {
            return undefined;
        }

        public destroy() {
        }

        public disable() {
        }

        public enable() {
        }

        public instance():Object {
            return undefined;
        }

        public option(arg:any):any {
            return undefined;
        }


        public element:JQuery;
        public document:JQuery;
        public namespace:string;
        public options:any;
        public uuid:number;
        public version:string;
        public widgetEventPrefix:string;
        public widgetFullName:string;
        public widgetName:string;
        public window:JQuery;

        constructor() {
            // remove all members, they are only needed at compile time.
            var myPrototype = (<Function>WidgetBase).prototype;
            $.each(myPrototype, (propertyName, value)=> {
                delete myPrototype[propertyName];
            });
        }


    }

    export class PackadicBoxWidget extends WidgetBase {
        public version:string = '1.0.0';
        public widgetEventPrefix:string = 'box.';

        public $section:JQuery;
        public $header:JQuery;
        public $controls:JQuery;
        public $close:JQuery;
        public $minimize:JQuery;
        public $move:JQuery;
        public $fullscreen:JQuery;

        public options:any = {
            controls: []
        };
        public defaults:any = {};

        constructor() {
            super();
        }


        public  _getDataAttributes() {
            var data:any = this.element.prefixedData('box');
            if (defined(data.controls)) {
                data.controls = data.controls.split(',');
            }
            return data;
        }

        public  _create() {
            var self:PackadicBoxWidget = this;
            this.$section = this.element.find('> section');
            this.$header = this.element.find('> header');

            this.options = $.extend(true, this.defaults, this._getDataAttributes(), this.options);

            if (this.options.controls.length > 0) {
                this._ensureControlsContainer();
                $.each(this.options.controls, function (i, control) {
                    self['_createControl' + control.charAt(0).toUpperCase() + control.substring(1)].call(self);
                });
            }

        }

        public  _createControl(typeName, iconClass):JQuery {
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
            return $a;
        }

        public _createControlClose() {
            console.log('_createControlClose');
            var self:PackadicBoxWidget = this;
            this.$close = this._createControl('close', 'fa fa-times');
            this.$controls.append(this.$close);
            this._off(this.$close, 'click');
            this._on(this.$close, {
                click(event) {
                    event.preventDefault();
                    self._trigger('close', event);
                    self.element.slideUp(300, function () {
                        self.element.remove();
                        self.destroy();
                    });
                }
            });
        }

        public _createControlMinimize() {
            console.log('_createControlMinimize');
            var self:PackadicBoxWidget = this;
            this.$minimize = this._createControl('minimize', 'fa fa-chevron-down');
            this.$controls.append(this.$minimize);
            this._off(this.$minimize, 'click');
            this._on(this.$minimize, {
                click: function (event) {
                    event.preventDefault();
                    var $i = self.$minimize.$i;
                    var $sec = self.options.scroll ? self.$section.parent() : self.$section;
                    if ($i.hasClass('fa-chevron-down')) {
                        self._trigger('minimize', event);
                        $sec.slideUp();
                        $i.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                    } else {
                        self._trigger('maximize', event);
                        $sec.slideDown();
                        $i.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                    }
                }
            });
        }

        public _createControlMove() {
            console.log('_createControlMove');
            this.$move = this._createControl('move', 'fa fa-arrows');
            this.$controls.append(this.$move);
            this.element.draggable({handle: this.$move});
        }

        public _createControlFullscreen() {
            console.log('_createControlMove');
            var self:PackadicBoxWidget = this;
            this.$fullscreen = this._createControl('move', 'fa fa-expand');
            this.$controls.append(this.$fullscreen);
            this._off(this.$fullscreen, 'click');
            this._on(this.$fullscreen, {
                click: function (event) {
                    event.preventDefault();
                    if (this.element.hasClass('box-fullscreen')) {
                        this.element.removeClass('on');
                        this.element.removeClass('box-fullscreen');
                        $body.removeClass('fullscreen');
                    } else {

                    }

                }
            });
        }

        public _ensureControlsContainer() {
            var $actions = this.$header.find('> .actions');
            var $controls = this.$header.find('> .controls');
            if ($controls.length == 0) {
                $controls = cre().addClass('controls');
                if ($actions.length > 0) {
                    $actions.before($controls);
                } else {
                    this.$header.append($controls)
                }
            }
            this.$controls = $controls;
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


    $.widget('packadic.box', new PackadicBoxWidget());

}

export = widgets;
