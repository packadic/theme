/// <reference path="definitions.d.ts" />
export declare class Util {
    static kindsOf: any;
    private static getParts(str);
    static objectGet(obj?: any, parts?: any, create?: any): any;
    static objectSet(obj: any, parts: any, value: any): any;
    static objectExists(obj: any, parts: any): boolean;
    static kindOf(value: any): any;
    static recurse(value: Object, fn: Function, fnContinue?: Function): any;
    static copyObject<T>(object: T): T;
}
export declare enum AppState {
    init = 0,
    preboot = 1,
    booting = 2,
    prestart = 3,
    starting = 4,
    started = 5,
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
    get(prop?: any): any;
    set(prop: string, value: any): IConfig;
    merge(obj: Object): IConfig;
    raw(prop?: any): any;
    process(raw: any): any;
}
export interface IConfigProperty extends IConfig {
    (args?: any): any;
}
export declare class Config implements IConfig {
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
export declare enum BoxAction {
    toggle = 0,
    hide = 1,
    show = 2,
    fullscreen = 3,
    normal = 4,
    close = 5,
    open = 6,
    loading = 7,
}
export declare enum ThemeAction {
    refresh = 0,
    reset = 1,
}
export declare enum SidebarAction {
    toggle = 0,
    hide = 1,
    show = 2,
    open = 3,
    close = 4,
    refresh = 5,
}
export interface ITheme extends Function {
    applyLayout(): any;
    reset(): any;
    toastr(): any;
    alert(): any;
    initSlimScroll(el: any, opts?: any): any;
    destroySlimScroll(el: any): any;
    ensureScrollToTop(): any;
    getTemplate(): any;
}
export interface ISidebar extends Function {
    isFixed(): boolean;
    isClosed(): boolean;
    close(callback?: Function): any;
    open(callback?: Function): any;
    hide(): any;
    show(): any;
    toggle(): any;
    refresh(): any;
}
export declare class App extends EventEmitter2 {
    private _startTime;
    private _config;
    private _defaultConfig;
    private _state;
    private _jade;
    private _s;
    private _theme;
    private _sidebar;
    config: IConfigProperty;
    packadic: any;
    private autoload;
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
    isSupported(propertyName: string): boolean;
    getTemplate(name: string, callback?: Function): App;
    /**
     * Returns the view port
     * @returns {{width: *, height: *}}
     */
    getViewPort(): {
        width: any;
        height: any;
    };
    /**
     * Checks if the current device is a touch device
     * @returns {boolean}
     */
    isTouchDevice(): boolean;
    /**
     * Generates a random ID
     * @param {Number} length
     * @returns {string}
     */
    getRandomId(length?: number): string;
    getBreakpoint(which: string): number;
    scrollTo(element: Element, to: number, duration: number): void;
}
