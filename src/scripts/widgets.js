var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'jquery', 'app/util', 'jquery-ui/widget', 'jquery-ui/draggable'], function (require, exports, $, util_1, _$widget, _$draggable) {
    _$widget; // fake using it for forcing it to load with requirejs
    _$draggable; // typescript otherwise omits the modules....
    var App = window['Application'];
    var widgets;
    (function (widgets) {
        var $body = $('body');
        var WidgetBase = (function () {
            function WidgetBase() {
                // remove all members, they are only needed at compile time.
                var myPrototype = WidgetBase.prototype;
                $.each(myPrototype, function (propertyName, value) {
                    delete myPrototype[propertyName];
                });
            }
            WidgetBase.prototype._create = function () {
                return undefined;
            };
            WidgetBase.prototype._destroy = function () {
            };
            WidgetBase.prototype._init = function () {
                return undefined;
            };
            WidgetBase.prototype._delay = function (fn, delay) {
                return undefined;
            };
            WidgetBase.prototype._focusable = function (element) {
                return undefined;
            };
            WidgetBase.prototype._getCreateEventData = function () {
                return undefined;
            };
            WidgetBase.prototype._getCreateOptions = function () {
                return undefined;
            };
            WidgetBase.prototype._hide = function (element, option, callback) {
                return undefined;
            };
            WidgetBase.prototype._hoverable = function (element) {
                return undefined;
            };
            WidgetBase.prototype._off = function (element, eventName) {
                return undefined;
            };
            WidgetBase.prototype._on = function (element, handlers) {
                return undefined;
            };
            WidgetBase.prototype._setOption = function (key, value) {
                return undefined;
            };
            WidgetBase.prototype._setOptions = function (options) {
                return undefined;
            };
            WidgetBase.prototype._show = function (element, option, callback) {
                return undefined;
            };
            WidgetBase.prototype._super = function (arg) {
            };
            WidgetBase.prototype._superApply = function (args) {
            };
            WidgetBase.prototype._trigger = function (type, args, data) {
                return undefined;
            };
            WidgetBase.prototype.destroy = function () {
            };
            WidgetBase.prototype.disable = function () {
            };
            WidgetBase.prototype.enable = function () {
            };
            WidgetBase.prototype.instance = function () {
                return undefined;
            };
            WidgetBase.prototype.option = function (arg) {
                return undefined;
            };
            return WidgetBase;
        })();
        widgets.WidgetBase = WidgetBase;
        var PackadicBoxWidget = (function (_super) {
            __extends(PackadicBoxWidget, _super);
            function PackadicBoxWidget() {
                _super.call(this);
                this.version = '1.0.0';
                this.widgetEventPrefix = 'box.';
                this.options = {
                    controls: []
                };
                this.defaults = {};
            }
            PackadicBoxWidget.prototype._getDataAttributes = function () {
                var data = this.element.prefixedData('box');
                if (util_1.defined(data.controls)) {
                    data.controls = data.controls.split(',');
                }
                return data;
            };
            PackadicBoxWidget.prototype._create = function () {
                var self = this;
                this.$section = this.element.find('> section');
                this.$header = this.element.find('> header');
                this.options = $.extend(true, this.defaults, this._getDataAttributes(), this.options);
                if (this.options.controls.length > 0) {
                    this._ensureControlsContainer();
                    $.each(this.options.controls, function (i, control) {
                        self['_createControl' + control.charAt(0).toUpperCase() + control.substring(1)].call(self);
                    });
                }
            };
            PackadicBoxWidget.prototype._createControl = function (typeName, iconClass) {
                var $a;
                $a = this.$controls.find('a[data-box-control="' + typeName + '"]');
                if ($a.length > 0) {
                    $a.$i = $a.find('> i');
                }
                else {
                    var $i = util_1.cre('i').addClass(iconClass);
                    $a = util_1.cre('a')
                        .attr('data-box-control', typeName)
                        .append($i)
                        .attr('href', '#');
                    $a.$i = $i;
                }
                return $a;
            };
            PackadicBoxWidget.prototype._createControlClose = function () {
                console.log('_createControlClose');
                var self = this;
                this.$close = this._createControl('close', 'fa fa-times');
                this.$controls.append(this.$close);
                this._off(this.$close, 'click');
                this._on(this.$close, {
                    click: function (event) {
                        event.preventDefault();
                        self._trigger('close', event);
                        self.element.slideUp(300, function () {
                            self.element.remove();
                            self.destroy();
                        });
                    }
                });
            };
            PackadicBoxWidget.prototype._createControlMinimize = function () {
                console.log('_createControlMinimize');
                var self = this;
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
                        }
                        else {
                            self._trigger('maximize', event);
                            $sec.slideDown();
                            $i.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                        }
                    }
                });
            };
            PackadicBoxWidget.prototype._createControlMove = function () {
                console.log('_createControlMove');
                this.$move = this._createControl('move', 'fa fa-arrows');
                this.$controls.append(this.$move);
                this.element.draggable({ handle: this.$move });
            };
            PackadicBoxWidget.prototype._createControlFullscreen = function () {
                console.log('_createControlMove');
                var self = this;
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
                        }
                        else {
                        }
                    }
                });
            };
            PackadicBoxWidget.prototype._ensureControlsContainer = function () {
                var $actions = this.$header.find('> .actions');
                var $controls = this.$header.find('> .controls');
                if ($controls.length == 0) {
                    $controls = util_1.cre().addClass('controls');
                    if ($actions.length > 0) {
                        $actions.before($controls);
                    }
                    else {
                        this.$header.append($controls);
                    }
                }
                this.$controls = $controls;
            };
            PackadicBoxWidget.prototype._destroy = function () {
                if (this.options.scroll) {
                    App.theme('destroySlimScroll', this.element.find('> section'));
                }
            };
            //  Any time the plugin is alled with no arguments or with only an option hash,
            // the widget is initialized; this includes when the widget is created.
            PackadicBoxWidget.prototype._init = function () {
                return undefined;
            };
            PackadicBoxWidget.prototype._setOptions = function (options) {
                var that = this;
                $.each(options, function (key, value) {
                    if (key == "draggable" || key == "droppable" || key == 'closeable') {
                        value = value === "true";
                    }
                    that._setOption(String(key), value);
                });
                return this;
            };
            return PackadicBoxWidget;
        })(WidgetBase);
        widgets.PackadicBoxWidget = PackadicBoxWidget;
        $.widget('packadic.box', new PackadicBoxWidget());
    })(widgets || (widgets = {}));
    return widgets;
});
