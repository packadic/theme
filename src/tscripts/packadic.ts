///<reference path="definitions.d.ts"/>
import autoloader = require('autoloader');


module packadic {
    export class Util {
        public static kindsOf:any = {};

        private static getParts(str):any {
            return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
                return s.replace(/\uffff/g, '.');
            });
        }

        public static objectGet(obj?:any, parts?:any, create?:any):any {
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
        }

        public static objectSet(obj, parts, value) {
            parts = Util.getParts(parts);

            var prop = parts.pop();
            obj = Util.objectGet(obj, parts, true);
            if (obj && typeof obj === 'object') {
                return (obj[prop] = value);
            }
        }

        public static objectExists(obj, parts) {
            parts = Util.getParts(parts);

            var prop = parts.pop();
            obj = Util.objectGet(obj, parts);

            return typeof obj === 'object' && obj && prop in obj;
        }

        public static kindOf(value:any):any {
            // Null or undefined.
            if (value == null) {
                return String(value);
            }
            // Everything else.
            return this.kindsOf[this.kindsOf.toString.call(value)] || 'object';
        }

        public static recurse(value:Object, fn:Function, fnContinue?:Function):any {
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
                } else if (Util.kindOf(value) === 'array') {
                    // If value is an array, recurse.
                    return value.map(function (item, index) {
                        return recurse(item, fn, fnContinue, {
                            objs: state.objs.concat([value]),
                            path: state.path + '[' + index + ']',
                        });
                    });
                } else if (Util.kindOf(value) === 'object') {
                    // If value is an object, recurse.
                    obj = {};
                    for (key in value) {
                        obj[key] = recurse(value[key], fn, fnContinue, {
                            objs: state.objs.concat([value]),
                            path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                        });
                    }
                    return obj;
                } else {
                    // Otherwise pass value into fn and return.
                    return fn(value);
                }
            }

            return recurse(value, fn, fnContinue, {objs: [], path: ''});
        }

        public static copyObject<T> (object:T):T {
            var objectCopy = <T>{};

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    objectCopy[key] = object[key];
                }
            }

            return objectCopy;
        }
    }

    'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function (k) {
        Util.kindsOf['[object ' + k + ']'] = k.toLowerCase();
    });
    declare var Obj:Object;
    export enum AppState {
        init,
        preboot,
        booting,
        prestart,
        starting,
        started
    }
    export interface IDelimitersCollection {
        [index: string]: IDelimiter;
    }
    export interface IDelimiterLodash {
        evaluate: RegExp;
        interpolate: RegExp;
        escape: RegExp;
    }
    export interface IDelimiter {

        opener?: string;
        closer?: string;
        lodash?: IDelimiterLodash;
    }

    export interface IConfig {
        get(prop?:any): any;
        set(prop:string, value:any): IConfig;
        merge(obj:Object): IConfig;
        raw(prop?:any): any;
        process(raw:any): any;
    }
    export interface IConfigProperty extends IConfig {
        (args?:any): any;

    }

    export class Config implements IConfig {
        private data:Object;
        private allDelimiters:IDelimitersCollection;
        private static propStringTmplRe:RegExp = /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i;


        constructor(obj?:Object) {
            this.allDelimiters = {};
            this.addDelimiters('config', '<%', '%>');
            this.data = obj || {}
        }


        public static getPropString(prop:any):string {
            return Array.isArray(prop) ? prop.map(this.escape).join('.') : prop;
        }

        public static escape(str:string):string {
            return str.replace(/\./g, '\\.');
        }

        public static makeProperty(config:IConfig):IConfigProperty {
            var cf:any = function (prop?:any):any {
                return config.get(prop);
            };
            cf.get = config.get.bind(config);
            cf.set = config.set.bind(config);
            cf.merge = config.merge.bind(config);
            cf.raw = config.raw.bind(config);
            cf.process = config.process.bind(config);
            return cf;
        }

        public raw(prop?:any):any {
            if (prop) {
                return Util.objectGet(this.data, Config.getPropString(prop));
            } else {
                return this.data;
            }
        }

        public get(prop?:any):any {
            return this.process(this.raw(prop));
        }

        public set(prop:string, value:any):IConfig {
            Util.objectSet(this.data, Config.getPropString(prop), value);
            return this;
        }

        public merge(obj:Object):IConfig {
            this.data = _.merge(this.data, obj);
            return this;
        }

        /**
         *
         * @param raw
         * @returns {any}
         */
        public process(raw:any):any {
            var self:Config = this;
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
                return self.processTemplate(value, {data: self.data});
            });
        }

        private addDelimiters(name, opener, closer) {
            var delimiters:IDelimiter = this.allDelimiters[name] = {};
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
        }

        private setDelimiters(name) {
            // Get the appropriate delimiters.
            var delimiters:IDelimiter = this.allDelimiters[name in this.allDelimiters ? name : 'config'];

            // Tell Lo-Dash which delimiters to use.
            _.templateSettings = delimiters.lodash;
            // Return the delimiters.
            return delimiters;
        }

        private processTemplate(tmpl:string, options:any):string {
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
            } catch (e) {
                //console.warn('config process template fail: ' + e.message);
            }

            // Normalize linefeeds and return.
            return tmpl.toString().replace(/\r\n|\n/g, '\n');
        }
    }

    export enum BoxAction {
        toggle, hide, show, fullscreen, normal, close, open, loading
    }

    export enum ThemeAction {
        init, refresh, reset
    }

    export enum SidebarAction {
        init, toggle, hide, show, open, close, refresh
    }

    export interface ITheme extends Function {
        applyLayout();
        reset();
        toastr();
        alert();
        initSlimScroll(el:any, opts?:any);
        destroySlimScroll(el:any);
        ensureScrollToTop();
        getTemplate();
        init();
    }

    export interface ISidebar extends Function {
        isFixed():boolean;
        isClosed():boolean;
        close(callback?:Function);
        open(callback?:Function);
        hide();
        show();
        toggle();
        refresh();
        init();
    }


    export class App extends EventEmitter2 {

        private _startTime:number;
        private _config:IConfig;
        private _defaultConfig:Object;
        private _state:AppState;
        private _jade:Object;
        private _s:UnderscoreStringStaticExports;
        private _theme:ITheme;
        private _sidebar:ISidebar;
        private $:JQueryStatic;


        public config:IConfigProperty;
        public packadic:any;
        public autoload:autoloader.Autoload;


        constructor() {
            var conf:EventEmitter2Configuration = {
                wildcard: true,
                delimiter: ':',
                newListener: true,
                maxListeners: 0
            };
            super(conf);
            var self:App = this;
            this._startTime = new Date().getTime();
            this._state = AppState.init;

        }

        //
        // PROPS
        public get colors():any {
            if (this._state >= AppState.prestart) {
                return this.config('scss.colors');
            } else {
                throw new Error('Cannot get colors, App state needs to be prestart or beyond')
            }
        }

        public get fonts():any {
            if (this._state >= AppState.prestart) {
                return this.config('scss.fonts');
            } else {
                throw new Error('Cannot get fonts, App state needs to be prestart or beyond')
            }
        }

        public get breakpoints():any {
            if (this._state >= AppState.prestart) {
                return this.config('scss.breakpoints');
            } else {
                throw new Error('Cannot get breakpoints, App state needs to be prestart or beyond')
            }
        }

        public get defaults():Object {
            return this._defaultConfig;
        }

        // STARTUP
        public init(config:Object) {
            this._defaultConfig = Util.copyObject(config);
            this._config = new Config(config);
            this.config = Config.makeProperty(this._config);
            this.setState(AppState.preboot);
        }

        public boot() {

            var self:App = this;
            if (this._state == AppState.init) {
                throw new Error('Cannot boot, still in init mote. Init first man');
            }
            this.setState(AppState.booting);
            require.config(this.config.get('requireJS'));

            require(['module', 'jquery', 'autoloader', 'string', 'jade', 'storage', 'code-mirror', 'plugins/cookie', 'jq/general'],
                function (module, $, autoloader, _s, jade, storage) {
                    self.$ = $;

                    self.autoload = new autoloader.Autoload();
                    self._jade = jade;
                    self._s = _s;

                    self.autoload.addDefaultDefinitions();

                    // SCSS Json
                    var scss:any = _s.unquote($('head').css('font-family'), "'");
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
                            isDebug = parseInt($.cookie('debug')) === 1
                        }
                        $('#debug-enable').on('click', function () {
                            $.cookie('debug', '1');
                            window.location.reload();

                        });
                        self.config.set('debug', isDebug);
                    }

                    // Startup, figure out what modules to load
                    var load:Array<string> = ['theme'];
                    var argMap:any = {theme: 1};
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
                        var getArg = (name)=> {
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
        }

        public defer():any {
            return this.$.Deferred();
        }

        public isDebug():boolean {
            return this.config('debug') == true;
        }

        public getElapsedTime():number {
            return (Date.now() - this._startTime) / 1000;
        }

        public getStartTime():number {
            return this._startTime / 1000;
        }

        public getState():AppState {
            return this._state;
        }


        private setState(state:AppState):App {
            this._state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
            return this;
        }

        // TOP LEVEL API
        public box(action:BoxAction, args?:any):App {
            var actionName:string = BoxAction[action];
            if (args && Util.kindOf(args) !== 'array') args = [args];
            this._theme.apply(action, args);
            return this;
        }


        public theme(action:ThemeAction, args?:any):JQueryPromise<any> {
            var self:App = this;
            var defer:any = this.defer();
            var actionName:any = typeof(action) == 'string' ? action : ThemeAction[action];
            if (args && Util.kindOf(args) !== 'array') args = [args];
            if (_.isUndefined(this._theme)) {
                require(['theme'], function (theme) {
                    self._theme = theme;
                    var returned = self._theme[actionName].apply(self._theme, args);
                    defer.resolve(returned);
                })
            } else {
                var returned = this._theme[actionName].apply(this._theme, args);
                defer.resolve(returned);
            }
            return defer.promise();
        }

        public sidebar(action:SidebarAction, args?:any):JQueryPromise<any> {
            var self:App = this;
            var defer:any = this.defer();
            var actionName:any = typeof(action) == 'string' ? action : SidebarAction[action];
            if (args && Util.kindOf(args) !== 'array') args = [args];
            if (_.isUndefined(this._sidebar)) {
                require(['theme/sidebar'], function (sidebar) {
                    self._sidebar = sidebar;
                    var returned = self._sidebar[actionName].apply(self._sidebar, args);
                    defer.resolve(returned);
                })
            } else {
                var returned = this._sidebar[actionName].apply(this._sidebar, args);
                defer.resolve(returned);
            }
            return defer.promise();
        }


        //
        /* HELPERS */
        //
        public removePageLoader():App {
            $('body').removeClass('page-loading');
            return this;
        }


        public colorizeDataOption(dataObj:Object, keys:Array<any>):Object {
            var self:App = this;
            if (typeof(keys) === 'string') {
                keys = (new Array()).concat([keys]);
            }
            $.each(keys, function (i, name) {
                if (!_.isUndefined(dataObj[name])) {
                    dataObj[name] = self.colors[dataObj[name]];
                }
            });
            return dataObj;
        }

        public isSupported(propertyName:string):boolean {
            var elm = document.createElement('div');
            propertyName = propertyName.toLowerCase();

            if (elm.style[propertyName] != undefined) {
                return true;
            }

            var propertyNameCapital = propertyName.charAt(0).toUpperCase() + propertyName.substr(1),
                domPrefixes = 'Webkit Moz ms O'.split(' ');

            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + propertyNameCapital] != undefined) {
                    return true;
                }
            }

            return false;
        }

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
        public getTemplate(name:string, callback?:Function):App {
            if (_.isUndefined(callback)) {
                var defer = this.defer();
            }
            require(['templates/' + name], function (template) {
                if (_.isUndefined(callback)) {
                    defer.resolve(template);
                } else {
                    callback(template);
                }
            });
            if (_.isUndefined(callback)) {
                return defer.promise();
            }
        }


        /**
         * Returns the view port
         * @returns {{width: *, height: *}}
         */
        public getViewPort() {
            var e:any = window,
                a:any = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }

            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        }

        /**
         * Checks if the current device is a touch device
         * @returns {boolean}
         */
        public isTouchDevice() {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        }

        /**
         * Generates a random ID
         * @param {Number} length
         * @returns {string}
         */
        public getRandomId(length?:number) {
            if (!_.isNumber(length)) {
                length = 15;
            }
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }

        public getBreakpoint(which:string) {
            return parseInt(this.breakpoints['screen-' + which + '-min'].replace('px', ''));
        }

        public scrollTo(element:Element, to:number, duration:number) {
            if (duration < 0) return;
            var difference = to - element.scrollTop;
            var perTick = difference / duration * 10;
            var self:App = this;
            setTimeout(function () {
                element.scrollTop = element.scrollTop + perTick;
                if (element.scrollTop === to) return;
                self.scrollTo(element, to, duration - 10);
            }, 10);
        }

    }
}


window['App'] = new packadic.App();
