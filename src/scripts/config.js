define([ 'jquery', 'lodash' ],
    function( $, _ ){
        'use strict';


        var dotaccess = function(){
            function parts(key) {
                if (Array.isArray(key)) return key;
                return key.split('.')
            }

            function lookup(obj, key) {
                key = parts(key);
                var lastKey = key.pop();
                for (var i = 0, l = key.length; i < l; i++) {
                    var part = key[i];
                    if (!(part in obj)) obj[part] = {};
                    obj = obj[part];
                    if (!obj) throw new Error('dotaccess: incompatible value in ' + part)
                }
                return [obj, lastKey];
            }


            return {
                dot_set: function (obj, key, value, overwrite) {
                    var objectAndKey = lookup(obj, key),
                        obj = objectAndKey[0],
                        key = objectAndKey[1];
                    if (overwrite || !(key in obj)) obj[key] = value
                },
                dot_get: function (obj, key, def) {
                    if (typeof key === 'undefined') {
                        return obj;
                    }
                    key = parts(key);
                    for (var i = 0, l = key.length; i < l; i++) {
                        var part = key[i];
                        if (!(part in obj)) return def;
                        obj = obj[part]
                    }
                    return obj
                },
                dot_del: function (obj, key) {
                    var objectAndKey = lookup(obj, key),
                        obj = objectAndKey[0],
                        key = objectAndKey[1];
                    return delete obj[key];
                }
            };
        }.call();



        var config = {
            debug: false
        };
        config.merge = function(options){
            config = _.merge(config, options);
            return config;
        };
        config.get = function(path, defaults){
            return dotaccess.dot_get(config, path, defaults);
        };
        config.set = function(path, value){
            var old = get(path);
            if(typeof old === 'object'){
                value = _.merge(old, value);
            }
            dotaccess.dot_set(config, path, value, true);
            return config
        };
        config.del = function(path){
            dotaccess.dot_del(config, path);
            return config;
        };
        config.clear = function(){
            config = {};
            return config;
        };



        return config;
    });
