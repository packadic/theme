///<reference path="types.d.ts"/>
import $ = require('jquery');
import {def, defined, cre} from 'app/util';

import _$widget = require('jquery-ui/widget');
import _$draggable = require('jquery-ui/draggable');
_$widget; // fake using it for forcing it to load with requirejs
_$draggable; // typescript otherwise omits the modules....


var App = window['App'];
module widgets {
    var $body:any = $('body');


    export class WidgetBase {
        _create():any {
            return undefined;
        }

        _destroy() {
        }

        _init():any {
            return undefined;
        }

        public _delay(fn:any, delay:number):number {
            return undefined;
        }


        public _focusable(element:JQuery):any {
            return undefined;
        }

        public _getCreateEventData():Object {
            return undefined;
        }

        public _getCreateOptions():Object {
            return undefined;
        }

        public _hide(element:JQuery, option:Object, callback:Function):any {
            return undefined;
        }

        public _hoverable(element:JQuery):any {
            return undefined;
        }


        public _off(element:JQuery, eventName:string):any {
            return undefined;
        }

        public _on(element:JQuery, handlers:Object):any {
            return undefined;
        }

        public _setOption(key:string, value:Object):any {
            return undefined;
        }

        public _setOptions(options:Object):any {
            return undefined;
        }

        public _show(element:JQuery, option:Object, callback:Function):any {
            return undefined;
        }

        public _super(arg:Object) {
        }

        public _superApply(args:Array<any>) {
        }

        public _trigger(type:String, args?:any[], data?:Object):any {
            return undefined;
        }

        public destroy() {
        }

        public disable() {
        }

        public enable() {
        }

        public instance():Object {
            return undefined;
        }

        public option(arg:any):any {
            return undefined;
        }


        public element:JQuery;
        public document:JQuery;
        public namespace:string;
        public options:any;
        public uuid:number;
        public version:string;
        public widgetEventPrefix:string;
        public widgetFullName:string;
        public widgetName:string;
        public window:JQuery;

        constructor() {
            // remove all members, they are only needed at compile time.
            var myPrototype = (<Function>WidgetBase).prototype;
            $.each(myPrototype, (propertyName, value)=> {
                delete myPrototype[propertyName];
            });
        }


    }

    export function make(name:string, proto:IWidget){
        $.widget(name, proto);
    }
    export function extend(name:string, parent:any, proto:IWidget){
        $.widget(name, parent, proto);
    }

}

export = widgets;
