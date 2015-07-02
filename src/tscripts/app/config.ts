///<reference path="../types.d.ts"/>
import {objectGet, objectSet, recurse} from 'app/util'
import {storage} from 'app/storage';

export class Config implements IConfig {
    private data:Object;
    private allDelimiters:IDelimitersCollection;
    private static propStringTmplRe:RegExp = /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i;

    private saveableProperties:Object;

    constructor(obj?:Object) {
        this.allDelimiters = {};
        this.addDelimiters('config', '<%', '%>');
        this.data = obj || {};
        this.saveableProperties = {};
    }

    public allowSaveOn(prop:string):IConfig {
        if (!this.canSaveOn(prop)) {
            this.saveableProperties[prop] = true;
        }
        return this;
    }

    public denySaveOn(prop:string):IConfig {
        if (this.canSaveOn(prop)) {
            delete this.saveableProperties[prop];
        }
        return this;
    }

    public canSaveOn(prop:string):boolean {
        return this.saveableProperties[prop] == true;
    }

    public getSavableProperties():string[] {
        return Object.keys(this.saveableProperties);
    }

    private saveProperty(prop:string){
        if(!this.canSaveOn(prop)){
            return;
        }
        storage.set(prop, this.raw(prop), {
            json: true
        });
    }
    public save(prop?:string):IConfig {
        var self:Config = this;
        if(prop){
            this.saveProperty(prop);
        } else {
            _.each(this.saveableProperties, function (prop:string, i) {
                self.saveProperty(prop)
            });
        }
        return this;
    }

    private loadProperty(prop:string){
        if(!this.canSaveOn(prop)){
            return;
        }
        var data = storage.set(prop, this.raw(prop), {
            json: true,
            'default': this.raw(prop)
        });
        this.set(prop, data);
    }

    public load(prop?:string):IConfig {
        var self:Config = this;
        if(prop){
            this.loadProperty(prop);
        } else {
            _.each(this.getSavableProperties(), function (prop:string, i) {
                self.loadProperty(prop);
            });
        }
        return this;
    }


    public static getPropString(prop:any):string {
        return Array.isArray(prop) ? prop.map(this.escape).join('.') : prop;
    }

    public static escape(str:string):string {
        return str.replace(/\./g, '\\.');
    }

    public static makeProperty(config:IConfig):IConfigProperty {
        var cf:any = function (prop?:any):any {
            return config.get(prop);
        };
        cf.get = config.get.bind(config);
        cf.set = config.set.bind(config);
        cf.merge = config.merge.bind(config);
        cf.raw = config.raw.bind(config);
        cf.process = config.process.bind(config);
        cf.save = config.save.bind(config);
        cf.load = config.load.bind(config);
        cf.allowSaveOn = config.allowSaveOn.bind(config);
        cf.denySaveOn = config.denySaveOn.bind(config);
        cf.canSaveOn = config.canSaveOn.bind(config);
        return cf;
    }

    public raw(prop?:any):any {
        if (prop) {
            return objectGet(this.data, Config.getPropString(prop));
        } else {
            return this.data;
        }
    }

    public get(prop?:any):any {
        return this.process(this.raw(prop));
    }

    public set(prop:string, value:any):IConfig {
        objectSet(this.data, Config.getPropString(prop), value);
        return this;
    }

    public merge(obj:Object):IConfig {
        this.data = _.merge(this.data, obj);
        return this;
    }

    /**
     *
     * @param raw
     * @returns {any}
     */
    public process(raw:any):any {
        var self:Config = this;
        return recurse(raw, function (value) {
            // If the value is not a string, return it.
            if (typeof value !== 'string') {
                return value;
            }
            // If possible, access the specified property via config.get, in case it
            // doesn't refer to a string, but instead refers to an object or array.
            var matches = value.match(Config.propStringTmplRe);
            var result;
            if (matches) {
                result = self.get(matches[1]);
                // If the result retrieved from the config data wasn't null or undefined,
                // return it.
                if (result != null) {
                    return result;
                }
            }
            // Process the string as a template.
            return self.processTemplate(value, {data: self.data});
        });
    }

    private addDelimiters(name, opener, closer) {
        var delimiters:IDelimiter = this.allDelimiters[name] = {};
        // Used by grunt.
        delimiters.opener = opener;
        delimiters.closer = closer;
        // Generate RegExp patterns dynamically.
        var a = delimiters.opener.replace(/(.)/g, '\\$1');
        var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
        // Used by Lo-Dash.
        delimiters.lodash = {
            evaluate: new RegExp(a + b, 'g'),
            interpolate: new RegExp(a + '=' + b, 'g'),
            escape: new RegExp(a + '-' + b, 'g')
        };
    }

    private setDelimiters(name) {
        // Get the appropriate delimiters.
        var delimiters:IDelimiter = this.allDelimiters[name in this.allDelimiters ? name : 'config'];

        // Tell Lo-Dash which delimiters to use.
        _.templateSettings = delimiters.lodash;
        // Return the delimiters.
        return delimiters;
    }

    private processTemplate(tmpl:string, options:any):string {
        if (!options) {
            options = {};
        }
        // Set delimiters, and get a opening match character.
        var delimiters = this.setDelimiters(options.delimiters);
        // Clone data, initializing to config data or empty object if omitted.
        var data = Object.create(options.data || this.data || {});

        // Keep track of last change.
        var last = tmpl;
        try {
            // As long as tmpl contains template tags, render it and get the result,
            // otherwise just use the template string.
            while (tmpl.indexOf(delimiters.opener) >= 0) {
                tmpl = _.template(tmpl)(data); //, delimiters.lodash);
                // Abort if template didn't change - nothing left to process!
                if (tmpl === last) {
                    break;
                }
                last = tmpl;
            }
        } catch (e) {
            //console.warn('config process template fail: ' + e.message);
        }

        // Normalize linefeeds and return.
        return tmpl.toString().replace(/\r\n|\n/g, '\n');
    }
}

