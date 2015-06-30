/// <reference path="../../../src/tscripts/definitions.d.ts" />
export interface IAutoloaderPlugin {
    fnName: string;
    selector: string;
    requires: Array<string>;
    dataName?: string;
    options?: Object;
    preInitFn?: Function;
}
export declare class Autoloader {
    private _plugins;
    private _custom;
    constructor();
    add(fnName: string, selector: string, requires: Array<string>, dataName?: string, options?: Object, preInitFn?: Function): Autoloader;
    addCustom(customFn: Function): Autoloader;
    scan($el: JQuery, callback?: Function): void;
}
