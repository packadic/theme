///<reference path="types.d.ts"/>
import $ = require('jquery');
import {defined, def, cre} from 'app/util';
import EventEmitter2 = require('eventemitter2');

var App = window['App'];

module tasks {
    export class Task extends EventEmitter2 {
        private $el:JQuery;
        private _id:number;
        private max:number;
        private value:number;
        private color:string;
        private text:string;
        private manager:TaskManager;

        constructor(manager:TaskManager){
            var conf:EventEmitter2Configuration = {
                wildcard: true,
                delimiter: ':',
                newListener: true,
                maxListeners: 0
            };
            super(conf);
            this.manager = manager;

        }

        public setValue(value:number){
            this.value = value;
        }
    }

    export class TaskManager {

    }


}


export = tasks
