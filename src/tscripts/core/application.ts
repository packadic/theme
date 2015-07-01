///<reference path="../types.d.ts"/>
import {copyObject,kindOf} from 'core/util'
import {Config} from 'core/config'
import {Autoload} from 'autoloader'
import EventEmitter2 = require("eventemitter2");


export enum AppState {
    init,
    preboot,
    booting,
    prestart,
    starting,
    started
}


export class Application extends EventEmitter2 {

    private _startTime:number;
    private _config:IConfig;
    private _defaultConfig:Object;
    private _state:AppState;
    private _jade:Object;
    private _s:any;
    private _theme:ITheme;
    private _sidebar:ISidebar;
    private $:JQueryStatic;


    public config:IConfigProperty;
    public packadic:any;
    public autoload:Autoload;


    constructor() {
        var conf:EventEmitter2Configuration = {
            wildcard: true,
            delimiter: ':',
            newListener: true,
            maxListeners: 0
        };
        super(conf);
        var self:Application = this;
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
        this._defaultConfig = copyObject(config);
        this._config = new Config(config);
        this.config = Config.makeProperty(this._config);
        this.setState(AppState.preboot);
    }

    public boot() {

        var self:Application = this;
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

                //self.autoload.addDefaultDefinitions();

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


    private setState(state:AppState):Application {
        this._state = state;
        this.emit('state:' + AppState[state], AppState[state], state);
        return this;
    }

    // TOP LEVEL API
    public box(action:BoxAction, args?:any):Application {
        var actionName:string = BoxAction[action];
        if (args && kindOf(args) !== 'array') args = [args];
        this._theme.apply(action, args);
        return this;
    }


    public theme(action:ThemeAction, args?:any):JQueryPromise<any> {
        var self:Application = this;
        var defer:any = this.defer();
        var actionName:any = typeof(action) == 'string' ? action : ThemeAction[action];
        if (args && kindOf(args) !== 'array') args = [args];
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
        var self:Application = this;
        var defer:any = this.defer();
        var actionName:any = typeof(action) == 'string' ? action : SidebarAction[action];
        if (args && kindOf(args) !== 'array') args = [args];
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
    public removePageLoader():Application {
        $('body').removeClass('page-loading');
        return this;
    }


    public colorizeDataOption(dataObj:Object, keys:Array<any>):Object {
        var self:Application = this;
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
    public getTemplate(name:string, callback?:Function):Application {
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
        var self:Application = this;
        setTimeout(function () {
            element.scrollTop = element.scrollTop + perTick;
            if (element.scrollTop === to) return;
            self.scrollTo(element, to, duration - 10);
        }, 10);
    }

}



