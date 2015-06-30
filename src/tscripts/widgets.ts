///<reference path="definitions.d.ts"/>
import $ = require('jquery');
require('jquery-ui/widget');
import def = require('fn/default');
import defined = require('fn/defined');
import cre = require('fn/cre');
//import async = require('plugins/async');

var App = window['App'];


module widgets {
    export interface JQuery {
        testWidget():JQuery;
        testWidget(options:any):JQuery;
        testWidget(methodName:string, param1?:any, param2?:any, param3?:any, param4?:any):JQuery;
    }

    export interface IWidget {
        _create():any;
        _delay(fn:any, delay?:number):number;
        _destroy();
        _focusable(element:JQuery):JQuery;
        _getCreateEventData():Object;
        _getCreateOptions():Object;
        _hide(element:JQuery, option:Object, callback?:Function):JQuery;
        _hoverable(element:JQuery):JQuery;
        _init():JQuery;
        _off(element:JQuery, eventName:string):JQuery;
        _on(element:JQuery, handlers:Object):JQuery;
        _setOption(key:string, value:Object):JQuery;
        _setOptions(options:Object):JQuery;
        _show(element:JQuery, option:Object, callback?:Function):JQuery;
        _super(...arg:Object[]);
        _superApply(args:Array<any>);
        _trigger(type:String, args?:any[], data?:Object):JQuery;
        destroy();
        disable();
        enable();
        instance():Object;
        option(...arg:any[]):any;
        widget():JQuery;
    }

    export class WidgetBase implements IWidget {
        _create():any {
            return undefined;
        }

        _delay(fn:any, delay:number):number {
            return undefined;
        }

        _destroy() {
        }

        _focusable(element:JQuery):JQuery {
            return undefined;
        }

        _getCreateEventData():Object {
            return undefined;
        }

        _getCreateOptions():Object {
            return undefined;
        }

        _hide(element:JQuery, option:Object, callback:Function):JQuery {
            return undefined;
        }

        _hoverable(element:JQuery):JQuery {
            return undefined;
        }

        _init():JQuery {
            return undefined;
        }

        _off(element:JQuery, eventName:string):JQuery {
            return undefined;
        }

        _on(element:JQuery, handlers:Object):JQuery {
            return undefined;
        }

        _setOption(key:string, value:Object):JQuery {
            return undefined;
        }

        _setOptions(options:Object):JQuery {
            return undefined;
        }

        _show(element:JQuery, option:Object, callback:Function):JQuery {
            return undefined;
        }

        _super(arg:Object) {
        }

        _superApply(args:Array<any>) {
        }

        _trigger(type:String, args:any[], data:Object):JQuery {
            return undefined;
        }

        destroy() {
        }

        disable() {
        }

        enable() {
        }

        instance():Object {
            return undefined;
        }

        option(arg:any):any {
            return undefined;
        }

        widget():JQuery {
            return undefined;
        }



        constructor() {
            // remove all members, they are only needed at compile time.
            var myPrototype = (<Function>WidgetBase).prototype;
            $.each(myPrototype, (propertyName, value)=> {
                delete myPrototype[propertyName];
            });
        }

        public element:JQuery;
        public document:JQuery;
        public namespace:string;
        public options:Object;
        public uuid:number;
        public version:string;
        widgetEventPrefix:string;
        widgetFullName:string;
        widgetName:string;
        window:JQuery;

    }

    export class TestWidget extends WidgetBase {

        constructor() {
            super();
        }

        public _create() {
            var mySmartOption = this.option('smart'); // compiles because of base class


        }


    }

    $.widget('packadic.testWidget', new TestWidget());
}

export = widgets;
