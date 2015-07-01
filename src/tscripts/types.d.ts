///<reference path="typings/tsd.d.ts"/>

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
    get(prop?:any): any;
    set(prop:string, value:any): IConfig;
    merge(obj:Object): IConfig;
    raw(prop?:any): any;
    process(raw:any): any;
}
interface IConfigProperty extends IConfig {
    (args?:any): any;

}

declare enum BoxAction {
    toggle, hide, show, fullscreen, normal, close, open, loading
}

declare enum ThemeAction {
    init, refresh, reset
}

declare enum SidebarAction {
    init, toggle, hide, show, open, close, refresh
}

interface ITheme extends Function {
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

interface ISidebar extends Function {
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

interface JQueryStatic {
    material:any;
}

interface JQuery {
    easyPieChart(...args:any[]);
}

/** EventEmitter2 fix to require and extend properly */
interface EventEmitter2Configuration {
    wildcard?: boolean;
    delimiter?: string;
    maxListeners?: number;
    newListener?: boolean;
}

declare class EventEmitter2 {
    constructor(conf?: EventEmitter2Configuration);
    addListener(event: string, listener: Function): EventEmitter2;
    on(event: string, listener: Function): EventEmitter2;
    onAny(listener: Function): EventEmitter2;
    offAny(listener: Function): EventEmitter2;
    once(event: string, listener: Function): EventEmitter2;
    many(event: string, timesToListen: number, listener: Function): EventEmitter2;
    removeListener(event: string, listener: Function): EventEmitter2;
    off(event: string, listener: Function): EventEmitter2;
    removeAllListeners(event?: string): EventEmitter2;
    setMaxListeners(n: number): void;
    listeners(event: string): Function[];
    listenersAny(): Function[];
    emit(event: string, ...args: any[]);
}
declare module "eventemitter2" {
    export = EventEmitter2;
}
