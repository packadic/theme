var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'core/util', 'core/config', "eventemitter2"], function (require, exports, util_1, config_1, EventEmitter2) {
    (function (AppState) {
        AppState[AppState["init"] = 0] = "init";
        AppState[AppState["preboot"] = 1] = "preboot";
        AppState[AppState["booting"] = 2] = "booting";
        AppState[AppState["prestart"] = 3] = "prestart";
        AppState[AppState["starting"] = 4] = "starting";
        AppState[AppState["started"] = 5] = "started";
    })(exports.AppState || (exports.AppState = {}));
    var AppState = exports.AppState;
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            var conf = {
                wildcard: true,
                delimiter: ':',
                newListener: true,
                maxListeners: 0
            };
            _super.call(this, conf);
            var self = this;
            this._startTime = new Date().getTime();
            this._state = AppState.init;
        }
        Object.defineProperty(Application.prototype, "colors", {
            get: function () {
                if (this._state >= AppState.prestart) {
                    return this.config('scss.colors');
                }
                else {
                    throw new Error('Cannot get colors, App state needs to be prestart or beyond');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "fonts", {
            get: function () {
                if (this._state >= AppState.prestart) {
                    return this.config('scss.fonts');
                }
                else {
                    throw new Error('Cannot get fonts, App state needs to be prestart or beyond');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "breakpoints", {
            get: function () {
                if (this._state >= AppState.prestart) {
                    return this.config('scss.breakpoints');
                }
                else {
                    throw new Error('Cannot get breakpoints, App state needs to be prestart or beyond');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "defaults", {
            get: function () {
                return this._defaultConfig;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype.init = function (config) {
            this._defaultConfig = util_1.copyObject(config);
            this._config = new config_1.Config(config);
            this.config = config_1.Config.makeProperty(this._config);
            this.setState(AppState.preboot);
        };
        Application.prototype.boot = function () {
            var self = this;
            if (this._state == AppState.init) {
                throw new Error('Cannot boot, still in init mote. Init first man');
            }
            this.setState(AppState.booting);
            require.config(this.config.get('requireJS'));
            require(['module', 'jquery', 'autoloader', 'string', 'jade', 'storage', 'code-mirror', 'plugins/cookie', 'jq/general'], function (module, $, autoloader, _s, jade, storage) {
                self.$ = $;
                self.autoload = new autoloader.Autoload();
                self._jade = jade;
                self._s = _s;
                var scss = _s.unquote($('head').css('font-family'), "'");
                while (typeof scss !== 'object') {
                    scss = JSON.parse(scss);
                }
                $.each(scss.fonts, function (k, v) {
                    scss.fonts[k] = v.join(', ');
                });
                self.config.set('scss', scss);
                self.config.merge({
                    chartjsGlobal: {
                        tooltipTitleFontFamily: scss.fonts.subheading,
                        tooltipFontFamily: scss.fonts.base,
                        scaleFontFamily: scss.fonts.heading
                    }
                });
                if (self.config.get('debug') !== true) {
                    var isDebug = false;
                    if (typeof $.cookie('debug') !== 'undefined') {
                        isDebug = parseInt($.cookie('debug')) === 1;
                    }
                    $('#debug-enable').on('click', function () {
                        $.cookie('debug', '1');
                        window.location.reload();
                    });
                    self.config.set('debug', isDebug);
                }
                var load = ['theme'];
                var argMap = { theme: 1 };
                if (self.config.get('theme.sidebarDisabled') !== true) {
                    argMap['theme/sidebar'] = load.push('theme/sidebar');
                }
                if (self.config.get('debug') === true) {
                    argMap['debug'] = load.push('debug');
                }
                if (self.config.get('demo') === true) {
                    argMap['demo'] = load.push('demo');
                }
                self.setState(AppState.prestart);
                require(load, function () {
                    var args = $.makeArray(arguments);
                    var getArg = function (name) {
                        return args[argMap[name] - 1];
                    };
                    self._theme = getArg('theme');
                    if (argMap['theme/sidebar']) {
                        self._sidebar = getArg('theme/sidebar');
                    }
                    self.setState(AppState.starting);
                    $(function () {
                        if (argMap.demo) {
                            getArg('demo').init();
                        }
                        self.theme(ThemeAction.init);
                        self.setState(AppState.started);
                    });
                });
            });
        };
        Application.prototype.defer = function () {
            return this.$.Deferred();
        };
        Application.prototype.isDebug = function () {
            return this.config('debug') == true;
        };
        Application.prototype.getElapsedTime = function () {
            return (Date.now() - this._startTime) / 1000;
        };
        Application.prototype.getStartTime = function () {
            return this._startTime / 1000;
        };
        Application.prototype.getState = function () {
            return this._state;
        };
        Application.prototype.setState = function (state) {
            this._state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
            return this;
        };
        Application.prototype.box = function (action, args) {
            var actionName = BoxAction[action];
            if (args && util_1.kindOf(args) !== 'array')
                args = [args];
            this._theme.apply(action, args);
            return this;
        };
        Application.prototype.theme = function (action, args) {
            var self = this;
            var defer = this.defer();
            var actionName = typeof (action) == 'string' ? action : ThemeAction[action];
            if (args && util_1.kindOf(args) !== 'array')
                args = [args];
            if (_.isUndefined(this._theme)) {
                require(['theme'], function (theme) {
                    self._theme = theme;
                    var returned = self._theme[actionName].apply(self._theme, args);
                    defer.resolve(returned);
                });
            }
            else {
                var returned = this._theme[actionName].apply(this._theme, args);
                defer.resolve(returned);
            }
            return defer.promise();
        };
        Application.prototype.sidebar = function (action, args) {
            var self = this;
            var defer = this.defer();
            var actionName = typeof (action) == 'string' ? action : SidebarAction[action];
            if (args && util_1.kindOf(args) !== 'array')
                args = [args];
            if (_.isUndefined(this._sidebar)) {
                require(['theme/sidebar'], function (sidebar) {
                    self._sidebar = sidebar;
                    var returned = self._sidebar[actionName].apply(self._sidebar, args);
                    defer.resolve(returned);
                });
            }
            else {
                var returned = this._sidebar[actionName].apply(this._sidebar, args);
                defer.resolve(returned);
            }
            return defer.promise();
        };
        Application.prototype.removePageLoader = function () {
            $('body').removeClass('page-loading');
            return this;
        };
        Application.prototype.colorizeDataOption = function (dataObj, keys) {
            var self = this;
            if (typeof (keys) === 'string') {
                keys = (new Array()).concat([keys]);
            }
            $.each(keys, function (i, name) {
                if (!_.isUndefined(dataObj[name])) {
                    dataObj[name] = self.colors[dataObj[name]];
                }
            });
            return dataObj;
        };
        Application.prototype.isSupported = function (propertyName) {
            var elm = document.createElement('div');
            propertyName = propertyName.toLowerCase();
            if (elm.style[propertyName] != undefined) {
                return true;
            }
            var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1), domPrefixes = 'Webkit Moz ms O'.split(' ');
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + propertyNameCapital] != undefined) {
                    return true;
                }
            }
            return false;
        };
        Application.prototype.getTemplate = function (name, callback) {
            if (_.isUndefined(callback)) {
                var defer = this.defer();
            }
            require(['templates/' + name], function (template) {
                if (_.isUndefined(callback)) {
                    defer.resolve(template);
                }
                else {
                    callback(template);
                }
            });
            if (_.isUndefined(callback)) {
                return defer.promise();
            }
        };
        Application.prototype.getViewPort = function () {
            var e = window, a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }
            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        };
        Application.prototype.isTouchDevice = function () {
            try {
                document.createEvent("TouchEvent");
                return true;
            }
            catch (e) {
                return false;
            }
        };
        Application.prototype.getRandomId = function (length) {
            if (!_.isNumber(length)) {
                length = 15;
            }
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };
        Application.prototype.getBreakpoint = function (which) {
            return parseInt(this.breakpoints['screen-' + which + '-min'].replace('px', ''));
        };
        Application.prototype.scrollTo = function (element, to, duration) {
            if (duration < 0)
                return;
            var difference = to - element.scrollTop;
            var perTick = difference / duration * 10;
            var self = this;
            setTimeout(function () {
                element.scrollTop = element.scrollTop + perTick;
                if (element.scrollTop === to)
                    return;
                self.scrollTo(element, to, duration - 10);
            }, 10);
        };
        return Application;
    })(EventEmitter2);
    exports.Application = Application;
});
