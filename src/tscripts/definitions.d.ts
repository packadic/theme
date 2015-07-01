///<reference path="definitions/eventemitter2.d.ts"/>
///<reference path="definitions/lodash.d.ts"/>
///<reference path="definitions/requirejs_require.d.ts"/>
///<reference path="definitions/jquery.d.ts"/>
///<reference path="definitions/underscore.string.d.ts"/>
///<reference path="definitions/jqueryui.d.ts"/>
///<reference path="definitions/async.d.ts"/>
declare module 'fn/default' {
    function def (primary:any, fallback:any):any;
    export = def;
}
declare module 'fn/cre' {
    function cre(tagName?:string):JQuery;
    export = cre;
}
declare module 'fn/defined' {
    function defined(obj:any):boolean;
    export = defined;
}
interface JQueryStatic {
    material?:any;
}

interface JQuery {
    iCheck(sel?:any, arg1?:any, arg2?:any, arg3?:any):JQuery;
    easyPieChart(sel?:any, arg1?:any, arg2?:any, arg3?:any):JQuery;
    slideUp(num:number, fun:Function):JQuery;
    slideDown(num:number, fun:Function):JQuery;
    prefixedData(prefix:string):Object;
    $i?:JQuery;
}
declare module 'jquery-ui/widget' {

}
declare module 'jquery-ui/draggable' {

}
