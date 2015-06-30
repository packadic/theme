/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_eventemitter2_eventemitter2.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_lodash_lodash.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_requirejs_require.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_underscore.string_underscore.string.d.ts" />
interface MyWindow extends Window {
    jade: any;
    _s: any;
    location: any;
}
declare module packadic {
    class Util {
        static kindsOf: any;
        private static getParts(str);
        static objectGet(obj?: any, parts?: any, create?: any): any;
        static objectSet(obj: any, parts: any, value: any): any;
        static objectExists(obj: any, parts: any): boolean;
        static kindOf(value: any): any;
        static recurse(value: Object, fn: Function, fnContinue?: Function): any;
        static copyObject<T>(object: T): T;
    }
    enum AppState {
        init = 0,
        preboot = 1,
        booting = 2,
        prestart = 3,
        starting = 4,
        started = 5,
    }
    interface IDelimitersCollection {
        [index: string]: IDelimiter;
    }
    interface IDelimiterLodash {
        evaluate: RegExp;
        interpolate: RegExp;
        escape: RegExp;
    }
    interface IDelimiter {
        opener?: string;
        closer?: string;
        lodash?: IDelimiterLodash;
    }
    interface IConfig {
        get(prop?: any): any;
        set(prop: string, value: any): IConfig;
        merge(obj: Object): IConfig;
        raw(prop?: any): any;
        process(raw: any): any;
    }
    interface IConfigProperty extends IConfig {
        (args?: any): any;
    }
    class Config implements IConfig {
        private data;
        private allDelimiters;
        private static propStringTmplRe;
        constructor(obj?: Object);
        static getPropString(prop: any): string;
        static escape(str: string): string;
        static makeProperty(config: IConfig): IConfigProperty;
        raw(prop?: any): any;
        get(prop?: any): any;
        set(prop: string, value: any): IConfig;
        merge(obj: Object): IConfig;
        /**
         *
         * @param raw
         * @returns {any}
         */
        process(raw: any): any;
        private addDelimiters(name, opener, closer);
        private setDelimiters(name);
        private processTemplate(tmpl, options);
    }
    enum BoxAction {
        toggle = 0,
        hide = 1,
        show = 2,
        fullscreen = 3,
        normal = 4,
        close = 5,
        open = 6,
        loading = 7,
    }
    enum ThemeAction {
        refresh = 0,
        reset = 1,
    }
    enum SidebarAction {
        toggle = 0,
        hide = 1,
        show = 2,
        open = 3,
        close = 4,
        refresh = 5,
    }
    interface ITheme extends Function {
        applyLayout(): any;
        reset(): any;
        createLoader(): any;
        toastr(): any;
        alert(): any;
        getTemplate(): any;
        getViewPort(): any;
        getBreakpoint(which: any): any;
        initSlimScroll(el: any, opts?: any): any;
        destroySlimScroll(el: any): any;
        ensureScrollToTop(): any;
        init(): any;
    }
    interface ISidebar extends Function {
        init(opts?: any): any;
        isFixed(): boolean;
        isClosed(): boolean;
        close(callback?: Function): any;
        open(callback?: Function): any;
        hide(): any;
        show(): any;
        toggle(): any;
        refresh(): any;
    }
    class App extends EventEmitter2 {
        private _startTime;
        private _config;
        private _defaultConfig;
        private _state;
        private _jade;
        private _s;
        config: IConfigProperty;
        private _theme;
        private _sidebar;
        packadic: any;
        constructor();
        colors: any;
        fonts: any;
        breakpoints: any;
        isDebug(): boolean;
        defaults: Object;
        getElapsedTime(): number;
        getStartTime(): number;
        getState(): AppState;
        removePageLoader(): App;
        init(config: Object): void;
        private setState(state);
        boot(): void;
        box(action: BoxAction, args?: any): App;
        theme(action: ThemeAction, args?: any): App;
        sidebar(action: SidebarAction, args?: any): App;
    }
}
