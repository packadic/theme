///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_eventemitter2_eventemitter2.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_requirejs_require.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts"/>
///<reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_underscore.string_underscore.string.d.ts"/>



interface MyWindow extends Window {
    jade: any;
    _s: any;
    location: any;
}


module packadic {
    declare var window:MyWindow;

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
        refresh, reset
    }

    export enum SidebarAction {
        toggle, hide, show, open, close, refresh
    }

    export interface ITheme extends Function {
        applyLayout();
        reset();
        createLoader();
        toastr();
        alert();
        getTemplate();
        getViewPort();
        getBreakpoint(which:any);
        initSlimScroll(el:any, opts?:any);
        destroySlimScroll(el:any);
        ensureScrollToTop();
        init();

    }

    export interface ISidebar extends Function {
        init(opts?:any);
        isFixed():boolean;
        isClosed():boolean;
        close(callback?:Function);
        open(callback?:Function);
        hide();
        show();
        toggle();
        refresh();
    }

    export class App extends EventEmitter2 {
        private _startTime:number;
        private _config:IConfig;
        private _defaultConfig:Object;
        private _state:AppState;
        private _jade:Object;
        private _s:UnderscoreStringStaticExports;
        public config:IConfigProperty;
        private _theme:ITheme;
        private _sidebar:ISidebar;
        public packadic:any;

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
            this.on('sidebar:init', function(sidebar){
                console.log('App sidebar:init', sidebar);
                if(!this._sidebar) {
                    self._sidebar = sidebar;
                }
            });

        }

        public get colors():any {
            if(this._state >= AppState.prestart) {
                return this.config('scss.colors');
            } else {
                throw new Error('Cannot get colors, App state needs to be prestart or beyond')
            }
        }
        public get fonts():any {
            if(this._state >= AppState.prestart) {
                return this.config('scss.fonts');
            } else {
                throw new Error('Cannot get fonts, App state needs to be prestart or beyond')
            }
        }
        public get breakpoints():any {
            if(this._state >= AppState.prestart) {
                return this.config('scss.breakpoints');
            } else {
                throw new Error('Cannot get breakpoints, App state needs to be prestart or beyond')
            }
        }

        public isDebug():boolean {
            return this.config('debug') == true;
        }

        public get defaults():Object {
            return this._defaultConfig;
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

        public removePageLoader():App {
            $('body').removeClass('page-loading');
            return this;
        }

        public init(config:Object) {
            this._defaultConfig = Util.copyObject(config);
            this._config = new Config(config);
            this.config = Config.makeProperty(this._config);
            this.setState(AppState.preboot);
        }

        private setState(state:AppState):App {
            this._state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
            return this;
        }

        public boot() {
            var self:App = this;
            if (this._state == AppState.init) {
                throw new Error('Cannot boot, still in init mote. Init first man');
            }
            this.setState(AppState.booting);
            require.config(this.config.get('requireJS'));
            require(['module', 'jquery', 'autoload', 'string', 'jade', 'storage', 'code-mirror', 'plugins/cookie', 'jq/general'],
                function (module, $, autoload, _s, jade, storage) {

                    self._jade = jade;
                    self._s = _s;

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
                            window.location.refresh();
                        });
                        self.config.set('debug', isDebug);
                    }

                    // Startup, figure out what modules to load
                    var load = ['theme'];
                    if (self.config.get('debug') === true) {
                        load.push('debug');
                    }
                    if (self.config.get('demo') === true) {
                        load.push('demo');
                    }


                    // EVENT: booted
                    self.setState(AppState.prestart);

                    require(load, function (theme, debug, demo) {
                        self._theme = theme;

                        // EVENT: starting
                        self.setState(AppState.starting);

                        if (self.config.get('demo') === true && _.isObject(demo)) {
                            demo.init();
                        }
                        theme.init();

                        // EVENT: started
                        self.setState(AppState.started);

                    });
                });
        }

        public box(action:BoxAction, args?:any):App {
            var actionName:string = BoxAction[action];
            if(args && Util.kindOf(args) !== 'array') args = [args];
            this._theme.apply(action, args);
            return this;
        }
        public theme(action:ThemeAction, args?:any):App {
            var actionName:any = typeof(action) == 'string' ? action : ThemeAction[action];
            if(args && Util.kindOf(args) !== 'array') args = [args];
            this._theme[actionName].apply(this._sidebar, args);
            return this;
        }
        public sidebar(action:SidebarAction, args?:any):App {
            var actionName:any = typeof(action) == 'string' ? action : SidebarAction[action];
            if(args && Util.kindOf(args) !== 'array') args = [args];
            this._sidebar[actionName].apply(this._sidebar, args);
            return this;
        }

    }

}
/**
 * @type {packadic.App}
 */
window['App'] = new packadic.App();
window['App'].packadic = packadic;
