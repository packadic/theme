///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_eventemitter2_eventemitter2.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_requirejs_require.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
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
            cf.raw = config.getRaw.bind(config);
            cf.process = config.process.bind(config);
            return cf;
        };
        Config.prototype.getRaw = function (prop) {
            if (prop) {
                return Util.objectGet(this.data, Config.getPropString(prop));
            }
            else {
                return this.data;
            }
        };
        Config.prototype.get = function (prop) {
            return this.process(this.getRaw(prop));
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
            this.startTime = new Date().getTime();
            this.state = AppState.init;
        }
        App.prototype.getElapsedTime = function () {
            return (Date.now() - this.startTime) / 1000;
        };
        App.prototype.getStartTime = function () {
            return this.startTime / 1000;
        };
        App.prototype.getState = function () {
            return this.state;
        };
        App.prototype.removePageLoader = function () {
            $('body').removeClass('page-loading');
            return this;
        };
        App.prototype.init = function (config) {
            this._config = new Config(config);
            this.config = Config.makeProperty(this._config);
            this.setState(AppState.preboot);
        };
        App.prototype.setState = function (state) {
            this.state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
            return this;
        };
        App.prototype.boot = function () {
            var self = this;
            if (this.state == AppState.init) {
                throw new Error('Cannot boot, still in init mote. Init first man');
            }
            this.setState(AppState.booting);
            require.config(this.config.get('requireJS'));
            require(['module', 'jquery', 'autoload', 'string', 'jade', 'storage', 'code-mirror', 'plugins/cookie', 'jq/general'], function (module, $, autoload, _s, jade, storage) {
                self.jade = jade;
                self._s = _s;
                // SCSS Json
                var scss = _s.unquote($('head').css('font-family'), "'");
                while (typeof scss !== 'object') {
                    scss = JSON.parse(scss);
                }
                self.config.set('scss', scss);
                self.config.merge({
                    chartjsGlobal: {
                        tooltipTitleFontFamily: scss.fonts.subheading.join(', '),
                        tooltipFontFamily: scss.fonts.base.join(', '),
                        scaleFontFamily: scss.fonts.heading.join(', ')
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
                        window.location.refresh();
                    });
                    self.config.set('debug', isDebug);
                }
                // Startup, figure out what modules to load
                var load = ['theme'];
                if (self.config('debug') === true) {
                    load.push('debug');
                }
                if (self.config('demo') === true) {
                    load.push('demo');
                }
                // EVENT: booted
                self.setState(AppState.prestart);
                require(load, function (theme, debug, demo) {
                    // EVENT: starting
                    self.setState(AppState.starting);
                    if (self.config.get('demo') === true && _.isObject(demo)) {
                        demo.init();
                    }
                    // EVENT: started
                    self.setState(AppState.started);
                });
            });
        };
        return App;
    })(EventEmitter2);
    packadic.App = App;
})(packadic || (packadic = {}));
/**
 * @type {packadic.App}
 */
window['App'] = new packadic.App();
