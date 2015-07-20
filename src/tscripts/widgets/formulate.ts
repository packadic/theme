///<reference path="../types.d.ts"/>
/// <amd-dependency path="plugins/jquery-serialize-object">
/// <amd-dependency path="plugins/jquery-form">
import $ = require('jquery');
import {def, defined, cre, trim,kindOf} from 'app/util';
import widgets = require('widgets');
import spawner = require('spawner');
import async = require('async');

var App = window['App'];
var $body:JQuery = $('body');

export interface FormulatePluginFunctions {
    bind($el:JQuery);
    unbind($el:JQuery);
    bound($el:JQuery):boolean;
}
export class FormulatePlugin {
    public name:string;
    public requires:string[];
    protected functions:FormulatePluginFunctions;

    constructor(name:string, requires:string[], functions:FormulatePluginFunctions){
        this.name = name;
        this.requires = requires;
        this.functions = functions;
    }
}
export class PackadicFormulateWidget extends widgets.WidgetBase implements IWidget {
    public version:string = '1.0.0';
    public widgetEventPrefix:string = 'formulate.';

    protected plugins:any = {};
    protected availablePlugins:any = {
        'maxlength': 'plugins/bs-maxlength'
    };

    public options:any = {
        validate: false,
        validationOptions: {
            rules: {}
        },
        ajax: false,
        ajaxOptions: {},
        plugins: {}
    };



    constructor(){
        super();
    }

    public  _getDataAttributes() {
        var data:any = this.element.prefixedData('formulate');
        return data;
    }

    public update(){
        var self:PackadicFormulateWidget = this;
        var o = this.options = $.extend(true, this.options, this._getDataAttributes());
        self._setValidation(o.validate, o.validationOptions);
        self._initPlugins();
        if(o.ajax) {
            self.element.ajaxForm(o.ajaxOptions);
        }
    }

    public serialize(){
        return this.element.formSerialize();
    }
    public serializeField(selector:string){
        return $(selector, this.element).fieldSerialize();
    }
    public serializeObject(){
        return this.element.serializeObject();
    }
    public serializeJSON(){
        return this.element.serializeJSON();
    }
    public reset(){
        return this.element.resetForm();
    }
    public clear(){
        return this.element.clearForm();
    }
    public clearFields(){
        return this.element.clearFields();
    }


    public  _create() {
        var self:PackadicFormulateWidget = this;
        self.addPlugin('maxlength', ['plugins/bs-maxlength'], {
            bind: function($el:JQuery){
                if(this.bound()){
                    this.unbind();
                }
                $el.maxlength();
            },
            unbind: function($el:JQuery){},
            bound: function($el:JQuery){
                return false;
            }
        });
        self.update();
    }

    public addPlugin(name:string, requires:string[], functions:FormulatePluginFunctions){
        var plugin:FormulatePlugin = new FormulatePlugin(name, requires, functions);
        this.plugins[name] = plugin;
    }
    public _loadPlugin(name:string, cb?:any){
        if(!this.availablePlugins[name]) return;
        require([this.availablePlugins[name]], function(){
            if(cb) cb(arguments);
        })
    }
    public _initPlugins(){
        var self:PackadicFormulateWidget = this;
        $.each(self.options.plugins, function(name, data){
            console.log('init plugin ', name, kindOf(data));
            var fields;
            if(kindOf(data) === 'array'){
                fields = data;
                self._loadPlugin(name, function(){

                })
            }
        })
    }


    public _setValidation(enabled:boolean, options?:any){
        var self:PackadicFormulateWidget = this;
        self.options.validate = enabled;
        self.options.validationOptions = $.extend(true, App.config('plugins.jquery-validate'), { rules: self._getParsedValidationFieldRules() }, options);
        if(enabled){
            require(['plugins/jquery-validate'], function(){
                self.element.validate(self.options.validationOptions);
            });
        } else {
            if(self.element.data('validator')){
                self.element.data('validator', null).unbind('validate');
            }
        }
    }

    public _getParsedValidationFieldRules(){
        var vrules = {};
        this.element.find('*[data-rules]').each(function (i) {
            var $el = $(this);
            var field = $el.attr('name') || $el.attr('id');
            vrules[field] = {};
            $el.data('rules').split('|').forEach(function (rule) {
                if ( rule.indexOf(':') > - 1 ) {
                    rule = rule.split(':', 2);
                    vrules[field][rule[0]] = rule[1];
                } else {
                    vrules[field][rule] = true;
                }
            })
        });
        return vrules;
    }


    public _destroy() {

    }

    //  Any time the plugin is alled with no arguments or with only an option hash,
    // the widget is initialized; this includes when the widget is created.
    public _init():any {
        return undefined;
    }

    public _setOption(key:string, value:any):any {
        var self:PackadicFormulateWidget = this;
        switch (key) {
            case 'hidden':
                break;
        }
        this._super(key, value);
        return this;
    }

}

widgets.make('packadic.formulate', new PackadicFormulateWidget());

