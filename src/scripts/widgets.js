var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'jquery'], function (require, exports, $) {
    require('jquery-ui/widget');
    //import async = require('plugins/async');
    var App = window['App'];
    var widgets;
    (function (widgets) {
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
            WidgetBase.prototype._delay = function (fn, delay) {
                return undefined;
            };
            WidgetBase.prototype._destroy = function () {
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
            WidgetBase.prototype._init = function () {
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
            WidgetBase.prototype.widget = function () {
                return undefined;
            };
            return WidgetBase;
        })();
        widgets.WidgetBase = WidgetBase;
        var TestWidget = (function (_super) {
            __extends(TestWidget, _super);
            function TestWidget() {
                _super.call(this);
            }
            TestWidget.prototype._create = function () {
                var mySmartOption = this.option('smart'); // compiles because of base class
            };
            return TestWidget;
        })(WidgetBase);
        widgets.TestWidget = TestWidget;
        $.widget('packadic.testWidget', new TestWidget());
    })(widgets || (widgets = {}));
    return widgets;
});
