var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'core/application'], function (require, exports, application_1) {
    var packadic;
    (function (packadic) {
        var App = (function (_super) {
            __extends(App, _super);
            function App() {
                _super.apply(this, arguments);
            }
            return App;
        })(application_1.Application);
        packadic.App = App;
    })(packadic || (packadic = {}));
    return packadic;
});
