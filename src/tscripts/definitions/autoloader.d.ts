/// <reference path="../../../src/tscripts/definitions.d.ts" />
declare module autoloader {
    class Autoload {
        private _plugins;
        private _custom;
        constructor();
        add(fnName: string, selector: string, requires: Array<string>, dataName?: string, options?: Object, preInitFn?: Function): Autoload;
        addCustom(customFn: Function): Autoload;
        scan($el: JQuery, callback?: Function): void;
    }
}
export = autoloader;
