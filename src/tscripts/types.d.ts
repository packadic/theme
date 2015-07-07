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
    save(prop?:string): IConfig;
    load(prop?:string):IConfig;
    allowSaveOn(prop:string):IConfig;
    denySaveOn(prop:string):IConfig;
    canSaveOn(prop:string):boolean;
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
interface JQueryStatic {
    material:any;
    cookie?:any;
    mCustomScrollbar?:any;
    ripples?:any;
    slimScroll?:any;
    sidebar?:any;
    box?:any;
    unblockUI():any;
    blockUI(...args:any[]):any;
}

interface JQuery {
    easyPieChart(...args:any[]);
    prefixedData(prefix:string);
    $i?:any;
    mCustomScrollbar(args?:any):JQuery;
    ripples(args?:any):JQuery;
    slimScroll(args?:any):JQuery;
    size():number;
    tooltip(args?:any):JQuery;
    TouchSpin(args?:any):JQuery;
    sidebar(...args:any[]):JQuery;
    box(...args:any[]):JQuery;
    block(...args:any[]):JQuery;
    unblock(...args:any[]):JQuery;
}

interface Window {
    attachEvent(name:string, handler?:Function);
}
declare var window:Window;

/** EventEmitter2 fix to require and extend properly */
interface EventEmitter2Configuration {
    wildcard?: boolean;
    delimiter?: string;
    maxListeners?: number;
    newListener?: boolean;
}

declare class EventEmitter2 {
    constructor(conf?:EventEmitter2Configuration);

    addListener(event:string, listener:Function):EventEmitter2;

    on(event:string, listener:Function):EventEmitter2;

    onAny(listener:Function):EventEmitter2;

    offAny(listener:Function):EventEmitter2;

    once(event:string, listener:Function):EventEmitter2;

    many(event:string, timesToListen:number, listener:Function):EventEmitter2;

    removeListener(event:string, listener:Function):EventEmitter2;

    off(event:string, listener:Function):EventEmitter2;

    removeAllListeners(event?:string):EventEmitter2;

    setMaxListeners(n:number):void;

    listeners(event:string):Function[];

    listenersAny():Function[];

    emit(event:string, ...args:any[]);
}

interface IWidget {
    _create():any;
    _destroy():any;
}

declare module widgets {
    class WidgetBase {
        _create():any;

        _destroy():void;

        _init():any;

        _delay(fn:any, delay:number):number;

        _focusable(element:JQuery):any;

        _getCreateEventData():Object;

        _getCreateOptions():Object;

        _hide(element:JQuery, option:Object, callback:Function):any;

        _hoverable(element:JQuery):any;

        _off(element:JQuery, eventName:string):any;

        _on(element:JQuery | string, handlers:Object):any;

        _setOption(key:string, value:Object):any;

        _setOptions(options:Object):any;

        _show(element:JQuery, option:Object, callback:Function):any;

        _super(...arg:any[]):void;

        _superApply(args:any):void;

        _trigger(type:String, args?:any[], data?:Object):any;

        destroy():void;

        disable():void;

        enable():void;

        instance():Object;

        option(arg:any):any;

        element:JQuery;
        document:JQuery;
        namespace:string;
        options:any;
        uuid:number;
        version:string;
        widgetEventPrefix:string;
        widgetFullName:string;
        widgetName:string;
        window:JQuery;
        protected bindings:JQuery;
        protected eventNamespace:string;

        constructor();
    }
    function make(name:string, proto:IWidget):void;

    function extend(name:string, parent:any, proto:IWidget):void;

    class PackadicSidebarWidget extends WidgetBase implements IWidget {
        version:string;
        widgetEventPrefix:string;
        openCloseInProgress:boolean;
        $nav:JQuery;
        options:any;
        defaults:any;

        constructor();

        _getDataAttributes():any;

        _onResize():void;

        _bind():void;

        _create():void;

        showLoader():void;

        hideLoader():void;

        /**
         * Checks if the sidebar is fixed
         * @returns {boolean}
         */
        isFixed():boolean;

        /**
         * Checks if the sidebar is closed
         * @returns {boolean}
         */
        isClosed():boolean;

        close(callback?:any):JQueryPromise<any>;

        open(callback?:any):JQueryPromise<any>;

        hide():void;

        show():void;

        _getSubmenuParents():JQuery;

        _handle():void;

        _handleFixed():void;

        _handleWithContent():void;

        _handleFixedHover():void;

        _handleToggler():void;

        _resolveActiveLink():void;

        _generateFromTemplate(menuItems:any, templateName?:any, callback?:any):JQueryPromise<any>;

        _trigger(type:String, args?:any[], data?:Object):any;

        _destroy():void;

        _init():any;

        _setOption(key:string, value:any):any;
    }

}

declare module AmCharts {
    function makeChart(id:any, opts:any): any
}

declare module "eventemitter2" {
    export = EventEmitter2;
}

declare module "jquery-ui/widget" {
}
declare module "jquery-ui/draggable" {
}
declare module "plugins/cookie" {
}
declare module "plugins/bs-material-ripples" {
}
declare module "plugins/blockui" {
}
declare module "plugins/chartjs" {
}
declare module "plugins/easypiechart" {
}
declare module "plugins/sparkline" {
}
declare module "flot" {
}
declare module "flot.pie" {
}
declare module 'amcharts/amcharts' {
    export = AmCharts;
}
declare module 'amcharts/serial' {
}
declare module 'amcharts/themes/light' {
}

interface HighlightJS {
    highlight(name:string, value:string, ignore_illegals?:boolean, continuation?:boolean) : any;
    highlightAuto(value:string, languageSubset?:string[]) : any;
    fixMarkup(value:string) : string;
    highlightBlock(block:Node) : void;
    configure(options:any): void;
    initHighlighting(): void;
    initHighlightingOnLoad(): void;
    registerLanguage(name:string, language:(hljs?:any) => any): void;
    listLanguages(): string[];
    getLanguage(name:string): any;
}
