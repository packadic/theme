/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_eventemitter2_eventemitter2.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_lodash_lodash.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_requirejs_require.d.ts" />
/// <reference path="../../../.WebIde80/system/extLibs/http_github.com_borisyankov_DefinitelyTyped_raw_master_jquery_jquery.d.ts" />
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
    class Config {
        private data;
        private allDelimiters;
        private static propStringTmplRe;
        constructor(obj?: any);
        static getPropString(prop: any): string;
        static escape(str: string): string;
        static makeProperty(config: Config): any;
        getRaw(prop?: any): any;
        get(prop?: any): any;
        set(prop: string, value: any): Config;
        merge(obj: Object): Config;
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
    class App extends EventEmitter2 {
        private startTime;
        private _config;
        private state;
        private jade;
        private _s;
        config: any;
        constructor();
        getElapsedTime(): number;
        getStartTime(): number;
        getState(): AppState;
        removePageLoader(): App;
        init(config?: any): void;
        private setState(state);
        boot(): void;
    }
}
