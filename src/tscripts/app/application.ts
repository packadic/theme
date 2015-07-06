///<reference path="../types.d.ts"/>
import {copyObject,kindOf,unquote,defined} from 'app/util'
import {Config} from 'app/config'
import {Autoload} from 'app/autoloader'
import EventEmitter2 = require("eventemitter2");
import {storage} from 'app/storage';
import {Layout} from 'app/layout';

export enum BoxAction {
    open, close,
    minimize, maximize, toggle,
    loader, loader_off,
    fullscreen, fullscreen_off, fullscreen_toggle
}

export enum LayoutAction {
    reset,
    fluid, boxed, // mode
    bottom_normal, bottom_hidden, bottom_fixed, // section#bottom
    top_normal, top_fixed,
    sidebar_open, sidebar_close, // sidebar toggle
    sidebar_hide, sidebar_show, // sidebar visibility
    sidebar_left, sidebar_right, // sidebar position
    sidebar_fixed, sidebar_normal, // sidebar fix
    sidebar_accordion, sidebar_hover // sidebar mode
}


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

    private $:JQueryStatic;
    private _layout:Layout;

    public storage:any;
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
        this.storage = storage;
        this._startTime = new Date().getTime();
        this._state = AppState.init;
        this.autoload = new Autoload();
        this.autoload.addDefaultDefinitions(this);
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
        requirejs.config(this.config.get('requireJS'));
        self._layout = new Layout(this);

        requirejs(['module', 'jquery', 'jade',  'code-mirror', 'plugins/cookie', 'jq/general'],
            function (module, $, jade) {
                self.$ = $;
                self._jade = jade;
                //self._theme = theme;

                //self.autoload.addDefaultDefinitions();

                // SCSS Json
                var scss:any = unquote($('head').css('font-family'), "'");
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
                var load:Array<string> = [];
                var argMap:any = {};
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

                    // EVENT: starting
                    self.setState(AppState.starting);

                    $(function () {
                       // self._theme.init();
                        if (argMap.demo) {
                            getArg('demo').init();
                        }
                        self.setState(AppState.started);
                    });
                    // EVENT: started

                });
            });
    }

    public defer():JQueryDeferred<any> {
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
        if (state > this._state) {
            this._state = state;
            this.emit('state:' + AppState[state], AppState[state], state);
        }
        return this;
    }

    // TOP LEVEL API
    public box(box:JQuery|string, action:BoxAction|string, args?:any):Application {
        require(['jquery', 'widgets/box'], function($){
            var actionName:string = typeof(action) === 'string' ? action.toString() : LayoutAction[action].toString();
            var $box:JQuery = typeof(box) === 'string' ? $(box) : box;

            if(!$box.is( ":data('packadicBox')" )){
                return;
            }
            if (args && kindOf(args) !== 'array') {
                args = [args];
            }

            switch (actionName) {
                case 'open': $box.box('open'); break;
                case 'close': $box.box('close'); break;
                case 'minimize': $box.box.apply($box, ['minimizeContent'].concat(args)); break;
                case 'maximize': $box.box.apply($box, ['maximizeContent'].concat(args)); break;
                case 'toggle': $box.box.apply($box, ['toggleContent'].concat(args)); break;
                case 'loader': $box.box.apply($box, ['startLoader'].concat(args)); break;
                case 'loader_off': $box.box.apply($box, ['stopLoader'].concat(args)); break;
                case 'fullscreen': $box.box.apply($box, ['fullscreen'].concat(args)); break;
                case 'fullscreen_off': $box.box.apply($box, ['exitFullscreen'].concat(args)); break;
                case 'fullscreen_toggle': $box.box.apply($box, ['toggleFullscreen'].concat(args)); break;
            }
        });
        return this;
    }

    public layout(action:LayoutAction|string, save:boolean=false):Application {
        var actionName:string = typeof(action) === 'string' ? action.toString() : LayoutAction[action].toString();
        switch(actionName){
            case 'reset': this._layout.reset(); break;
            case 'fluid': this._layout.set('mode', 'fluid'); break;
            case 'boxed': this._layout.set('mode', 'boxed'); break;
            case 'bottom_normal': this._layout.set('bottom', 'normal'); break;
            case 'bottom_hidden': this._layout.set('bottom', 'hidden'); break;
            case 'bottom_fixed': this._layout.set('bottom', 'fixed'); break;
            case 'top_normal': this._layout.set('top', 'normal'); break;
            case 'top_fixed': this._layout.set('top', 'fixed'); break;
            case 'sidebar_open': this._layout.sidebar.open(); break;
            case 'sidebar_close': this._layout.sidebar.close(); break;
            case 'sidebar_hide': this._layout.sidebar.hide(); break;
            case 'sidebar_show': this._layout.sidebar.show(); break;
            case 'sidebar_left': this._layout.set('sidebar.position', 'left'); break;
            case 'sidebar_right': this._layout.set('sidebar.position', 'right'); break;
            case 'sidebar_normal': this._layout.set('sidebar.fixed', false); break;
            case 'sidebar_fixed': this._layout.set('sidebar.fixed', true); break;
            case 'sidebar_hover': this._layout.set('sidebar.mode', 'hover'); break;
            case 'sidebar_accordion': this._layout.set('sidebar.mode', 'accordion'); break;
        }
        if(save){
            this._layout.save();
        }
        return this;
    }

    public notify(fnName:string, message:string, title?:string, options?:any) {
        var self:Application = this;
        if(fnName === 'danger') fnName = 'error';
        require(['plugins/toastr'], function (toastr:any) {
            var args = [message];
            if (title) {
                args.push(title);
            }
            if (options) {
                args.push(options);
            }
            toastr.options = self.config.get('plugins.toastr');
            toastr[fnName].apply(toastr, args);
        });
    }

    public clearNotify(useAnimation:boolean = true) {
        require(['plugins/toastr'], function (toastr) {
            if (useAnimation) {
                toastr.clear();
            } else {
                toastr.remove();
            }
        });
    }

    public initSidebar(opts:any={}, callback?:any):JQueryPromise<any> {
        return this._layout.initSidebar(opts, callback);
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
    public getTemplate(name:string, callback?:Function):JQueryPromise<any> {
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



