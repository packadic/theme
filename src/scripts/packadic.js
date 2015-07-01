var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
function asd(name) {
}
var packadic;
(function (packadic) {
    var Util = (function () {
        function Util() {
        }
        Util.getParts = function (str) {
            return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
                return s.replace(/\uffff/g, '.');
            });
        };
        Util.objectGet = function (obj, parts, create) {
            if (typeof parts === 'string') {
                parts = Util.getParts(parts);
            }
            var part;
            while (typeof obj === 'object' && obj && parts.length) {
                part = parts.shift();
                if (!(part in obj) && create) {
                    obj[part] = {};
                }
                obj = obj[part];
            }
            return obj;
        };
        Util.objectSet = function (obj, parts, value) {
            parts = Util.getParts(parts);
            var prop = parts.pop();
            obj = Util.objectGet(obj, parts, true);
            if (obj && typeof obj === 'object') {
                return (obj[prop] = value);
            }
        };
        Util.objectExists = function (obj, parts) {
            parts = Util.getParts(parts);
            var prop = parts.pop();
            obj = Util.objectGet(obj, parts);
            return typeof obj === 'object' && obj && prop in obj;
        };
        Util.kindOf = function (value) {
            // Null or undefined.
            if (value == null) {
                return String(value);
            }
            // Everything else.
            return this.kindsOf[this.kindsOf.toString.call(value)] || 'object';
        };
        Util.recurse = function (value, fn, fnContinue) {
            function recurse(value, fn, fnContinue, state) {
                var error;
                if (state.objs.indexOf(value) !== -1) {
                    error = new Error('Circular reference detected (' + state.path + ')');
                    error.path = state.path;
                    throw error;
                }
                var obj, key;
                if (fnContinue && fnContinue(value) === false) {
                    // Skip value if necessary.
                    return value;
                }
                else if (Util.kindOf(value) === 'array') {
                    // If value is an array, recurse.
                    return value.map(function (item, index) {
                        return recurse(item, fn, fnContinue, {
                            objs: state.objs.concat([value]),
                            path: state.path + '[' + index + ']',
                        });
                    });
                }
                else if (Util.kindOf(value) === 'object') {
                    // If value is an object, recurse.
                    obj = {};
                    for (key in value) {
                        obj[key] = recurse(value[key], fn, fnContinue, {
                            objs: state.objs.concat([value]),
                            path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                        });
                    }
                    return obj;
                }
                else {
                    // Otherwise pass value into fn and return.
                    return fn(value);
                }
            }
            return recurse(value, fn, fnContinue, { objs: [], path: '' });
        };
        Util.copyObject = function (object) {
            var objectCopy = {};
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    objectCopy[key] = object[key];
                }
            }
            return objectCopy;
        };
        Util.kindsOf = {};
        return Util;
    })();
    packadic.Util = Util;
    'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function (k) {
        Util.kindsOf['[object ' + k + ']'] = k.toLowerCase();
    });
    (function (AppState) {
        AppState[AppState["init"] = 0] = "init";
        AppState[AppState["preboot"] = 1] = "preboot";
        AppState[AppState["booting"] = 2] = "booting";
        AppState[AppState["prestart"] = 3] = "prestart";
        AppState[AppState["starting"] = 4] = "starting";
        AppState[AppState["started"] = 5] = "started";
    })(packadic.AppState || (packadic.AppState = {}));
    var AppState = packadic.AppState;
    var Config = (function () {
        function Config(obj) {
            this.allDelimiters = {};
            this.addDelimiters('config', '<%', '%>');
            this.data = obj || {};
        }
        Config.getPropString = function (prop) {
            return Array.isArray(prop) ? prop.map(this.escape).join('.') : prop;
        };
        Config.escape = function (str) {
            return str.replace(/\./g, '\\.');
        };
        Config.makeProperty = function (config) {
            var cf = function (prop) {
                return config.get(prop);
            };
            cf.get = config.get.bind(config);
            cf.set = config.set.bind(config);
            cf.merge = config.merge.bind(config);
            cf.raw = config.raw.bind(config);
            cf.process = config.process.bind(config);
            return cf;
        };
        Config.prototype.raw = function (prop) {
            if (prop) {
                return Util.objectGet(this.data, Config.getPropString(prop));
            }
            else {
                return this.data;
            }
        };
        Config.prototype.get = function (prop) {
            return this.process(this.raw(prop));
        };
        Config.prototype.set = function (prop, value) {
            Util.objectSet(this.data, Config.getPropString(prop), value);
            return this;
        };
        Config.prototype.merge = function (obj) {
            this.data = _.merge(this.data, obj);
            return this;
        };
        /**
         *
         * @param raw
         * @returns {any}
         */
        Config.prototype.process = function (raw) {
            var self = this;
            return Util.recurse(raw, function (value) {
                // If the value is not a string, return it.
                if (typeof value !== 'string') {
                    return value;
                }
                // If possible, access the specified property via config.get, in case it
                // doesn't refer to a string, but instead refers to an object or array.
                var matches = value.match(Config.propStringTmplRe);
                var result;
                if (matches) {
                    result = self.get(matches[1]);
                    // If the result retrieved from the config data wasn't null or undefined,
                    // return it.
                    if (result != null) {
                        return result;
                    }
                }
                // Process the string as a template.
                return self.processTemplate(value, { data: self.data });
            });
        };
        Config.prototype.addDelimiters = function (name, opener, closer) {
            var delimiters = this.allDelimiters[name] = {};
            // Used by grunt.
            delimiters.opener = opener;
            delimiters.closer = closer;
            // Generate RegExp patterns dynamically.
            var a = delimiters.opener.replace(/(.)/g, '\\$1');
            var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
            // Used by Lo-Dash.
            delimiters.lodash = {
                evaluate: new RegExp(a + b, 'g'),
                interpolate: new RegExp(a + '=' + b, 'g'),
                escape: new RegExp(a + '-' + b, 'g')
            };
        };
        Config.prototype.setDelimiters = function (name) {
            // Get the appropriate delimiters.
            var delimiters = this.allDelimiters[name in this.allDelimiters ? name : 'config'];
            // Tell Lo-Dash which delimiters to use.
            _.templateSettings = delimiters.lodash;
            // Return the delimiters.
            return delimiters;
        };
        Config.prototype.processTemplate = function (tmpl, options) {
            if (!options) {
                options = {};
            }
            // Set delimiters, and get a opening match character.
            var delimiters = this.setDelimiters(options.delimiters);
            // Clone data, initializing to config data or empty object if omitted.
            var data = Object.create(options.data || this.data || {});
            // Keep track of last change.
            var last = tmpl;
            try {
                // As long as tmpl contains template tags, render it and get the result,
                // otherwise just use the template string.
                while (tmpl.indexOf(delimiters.opener) >= 0) {
                    tmpl = _.template(tmpl)(data); //, delimiters.lodash);
                    // Abort if template didn't change - nothing left to process!
                    if (tmpl === last) {
                        break;
                    }
                    last = tmpl;
                }
            }
            catch (e) {
            }
            // Normalize linefeeds and return.
            return tmpl.toString().replace(/\r\n|\n/g, '\n');
        };
        Config.propStringTmplRe = /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i;
        return Config;
    })();
    packadic.Config = Config;
    (function (BoxAction) {
        BoxAction[BoxAction["toggle"] = 0] = "toggle";
        BoxAction[BoxAction["hide"] = 1] = "hide";
        BoxAction[BoxAction["show"] = 2] = "show";
        BoxAction[BoxAction["fullscreen"] = 3] = "fullscreen";
        BoxAction[BoxAction["normal"] = 4] = "normal";
        BoxAction[BoxAction["close"] = 5] = "close";
        BoxAction[BoxAction["open"] = 6] = "open";
        BoxAction[BoxAction["loading"] = 7] = "loading";
    })(packadic.BoxAction || (packadic.BoxAction = {}));
    var BoxAction = packadic.BoxAction;
    (function (ThemeAction) {
        ThemeAction[ThemeAction["init"] = 0] = "init";
        ThemeAction[ThemeAction["refresh"] = 1] = "refresh";
        ThemeAction[ThemeAction["reset"] = 2] = "reset";
    })(packadic.ThemeAction || (packadic.ThemeAction = {}));
    var ThemeAction = packadic.ThemeAction;
    (function (SidebarAction) {
        SidebarAction[SidebarAction["init"] = 0] = "init";
        SidebarAction[SidebarAction["toggle"] = 1] = "toggle";
        SidebarAction[SidebarAction["hide"] = 2] = "hide";
        SidebarAction[SidebarAction["show"] = 3] = "show";
        SidebarAction[SidebarAction["open"] = 4] = "open";
        SidebarAction[SidebarAction["close"] = 5] = "close";
        SidebarAction[SidebarAction["refresh"] = 6] = "refresh";
    })(packadic.SidebarAction || (packadic.SidebarAction = {}));
    var SidebarAction = packadic.SidebarAction;
    var App = (function (_super) {
        __extends(App, _super);
        function App() {
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
        Object.defineProperty(App.prototype, "colors", {
            //
            // PROPS
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
        Object.defineProperty(App.prototype, "fonts", {
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
        Object.defineProperty(App.prototype, "breakpoints", {
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
        Object.defineProperty(App.prototype, "defaults", {
            get: function () {
                return this._defaultConfig;
            },
            enumerable: true,
            configurable: true
        });
        // STARTUP
        App.prototype.init = function (config) {
            this._defaultConfig = Util.copyObject(config);
            this._config = new Config(config);
            this.config = Config.makeProperty(this._config);
            this.setState(AppState.preboot);
        };
        App.prototype.boot = function () {
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
                self.autoload.addDefaultDefinitions();
                // SCSS Json
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
                // Debug
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
                // Startup, figure out what modules to load
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
                // EVENT: booted
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
                    // EVENT: starting
                    self.setState(AppState.starting);
                    $(function () {
                        if (argMap.demo) {
                            getArg('demo').init();
                        }
                        self.theme(ThemeAction.init);
                        self.setState(AppState.started);
                    });
                    // EVENT: started
                });
            });
        };
        App.prototype.defer = function () {
            return this.$.Deferred();
        };
        App.prototype.isDebug = function () {
            return this.config('debug') == true;
        };
        App.prototype.getElapsedTime = function () {
            return (Date.now() - this._startTime) / 1000;
        };
        App.prototype.getStartTime = function () {
            return this._startTime / 1000;
        };
        App.prototype.getState = function () {
            return this._state;
        };
        App.prototype.setState = function (state) {
            this._state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
            return this;
        };
        // TOP LEVEL API
        App.prototype.box = function (action, args) {
            var actionName = BoxAction[action];
            if (args && Util.kindOf(args) !== 'array')
                args = [args];
            this._theme.apply(action, args);
            return this;
        };
        App.prototype.theme = function (action, args) {
            var self = this;
            var defer = this.defer();
            var actionName = typeof (action) == 'string' ? action : ThemeAction[action];
            if (args && Util.kindOf(args) !== 'array')
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
        App.prototype.sidebar = function (action, args) {
            var self = this;
            var defer = this.defer();
            var actionName = typeof (action) == 'string' ? action : SidebarAction[action];
            if (args && Util.kindOf(args) !== 'array')
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
        //
        /* HELPERS */
        //
        App.prototype.removePageLoader = function () {
            $('body').removeClass('page-loading');
            return this;
        };
        App.prototype.colorizeDataOption = function (dataObj, keys) {
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
        App.prototype.isSupported = function (propertyName) {
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
        /**
         * Loads a compiled jade template from scripts/template directory. Can be used multiple times
         * @param {string} name - The filename (without extension) of the template
         * @param {function} [cb] - Optional callback, omit if you rather use a promise
         * @returns {promise.promise|jQuery.promise|jQuery.ready.promise}
         * @example
         * // Using the promise
         * theme.getTemplate('template-name').then(function(template){
         *     var html = template({
         *         var1: 'Hello', var2: 'Bai'
         *     });
         * });
         * // Using the callback
         * theme.getTemplate('template-name', function(template){
         *     var html = template({
         *         var1: 'Hello', var2: 'Bai'
         *     });
         * });
         */
        App.prototype.getTemplate = function (name, callback) {
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
        /**
         * Returns the view port
         * @returns {{width: *, height: *}}
         */
        App.prototype.getViewPort = function () {
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
        /**
         * Checks if the current device is a touch device
         * @returns {boolean}
         */
        App.prototype.isTouchDevice = function () {
            try {
                document.createEvent("TouchEvent");
                return true;
            }
            catch (e) {
                return false;
            }
        };
        /**
         * Generates a random ID
         * @param {Number} length
         * @returns {string}
         */
        App.prototype.getRandomId = function (length) {
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
        App.prototype.getBreakpoint = function (which) {
            return parseInt(this.breakpoints['screen-' + which + '-min'].replace('px', ''));
        };
        App.prototype.scrollTo = function (element, to, duration) {
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
        return App;
    })(EventEmitter2);
    packadic.App = App;
})(packadic || (packadic = {}));
window['Application'] = new packadic.App();
